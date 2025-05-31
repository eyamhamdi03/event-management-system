import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';


import { FindOptionsWhere, Repository } from 'typeorm';
import { Registration } from './entities/registration.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Event } from 'src/event/entities/event.entity';

import { EventDto, RegistrationResponseDto, UserDto } from './dto/registration-response.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Role } from 'src/auth/roles.enum';
import { MailService } from '../mail/mail.service'; 
import { QrCodeService } from '../qrcode/qrcode.service';
import { log } from 'console';
import { RegistrationExportDto } from './dto/registration-export.dto';
@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,    
    private readonly mailService: MailService,
    private qrCodeService: QrCodeService, 
  ) {}

  async getRegistrations(): Promise<RegistrationResponseDto[]> {
    const registrations = await this.registrationRepo.find({
      relations: ['user', 'event'], 
    });

    return registrations.map((registration) => {
      const dto = new RegistrationResponseDto();

      // Map main registration fields
      dto.id = registration.id;
      dto.confirmed = registration.confirmed;
      dto.createdAt = registration.createdAt;
      dto.eventId = registration.event.id;

      // Map user relation
      if (registration.user) {
        const userDto = new UserDto();
        userDto.id = registration.user.id;
        userDto.fullName = registration.user.fullName;
        userDto.email = registration.user.email;
        dto.user = userDto;
      }

      // Map event relation
      if (registration.event) {
        const eventDto = new EventDto();
        eventDto.title = registration.event.title;
        dto.event = eventDto;
      }

      return dto;
    });
  }

  async registerToEvent(eventId: string, userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const event = await this.eventRepo.findOne({ where: { id: eventId } });

    if (!event) throw new NotFoundException('Event not found');
    if (!user ) throw new NotFoundException('User not found');

    const currentCount = await this.registrationRepo.count({ where: { event: { id: eventId } } });

    if (currentCount >= event.participantLimit) {
      throw new BadRequestException('Event has reached full capacity');
    }

    const existing = await this.registrationRepo.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
      },
    });

    if (existing) {
      throw new ConflictException('Already registered');
    }

    const registration = this.registrationRepo.create({
      user,
      event,
      confirmed: false,
    });
    const savedRegistration = await this.registrationRepo.save(registration);


    return { registration: savedRegistration };
  }

  async getRegistrationsForEvent(
    eventId: string,
  ): Promise<RegistrationResponseDto[]> {
    const registrations = await this.registrationRepo.find({
      where: { event: { id: eventId } },
      relations: ['user', 'event'], 
    });

    return registrations.map((registration) => {
      return plainToInstance(
        RegistrationResponseDto,
        {
          ...registration,
          user: plainToInstance(UserDto, registration.user),
          event: plainToInstance(EventDto, registration.event),
        },
        {
          excludeExtraneousValues: true,
        },
      );
    });
  }

  async cancelRegistration(
    eventId: string,
    userId: string,
    currentUserRole: string,
    currentUserId: string,
  ) {
    const registration = await this.registrationRepo.findOne({
      where: {
        event: { id: eventId },
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (
      currentUserRole !== 'organizer' &&
      registration.user.id !== currentUserId
    ) {
      throw new ForbiddenException(
        'You can only cancel your own registrations',
      );
    }

  
  await this.registrationRepo.remove(registration);
}

  async confirmRegistration(id: string) {
    const registration = await this.registrationRepo.findOne({
      where: { id },
      relations: ['user', 'event'],
    });
    if (!registration) throw new NotFoundException('Registration not found');
    registration.confirmed = true;

    // Generate QR code for this registration
    const qrLink = `https://localhost:3000/registration/scan/${registration.id}`;
    const qrCode = await this.qrCodeService.generateQrCode(qrLink);
    log('QR Code generated:', qrCode);
    await this.mailService.sendRegistrationConfirmation(
      registration.user.email,
      registration.user.fullName,
      registration.event.title,
      registration.event.eventDate.toISOString().split('T')[0],
      qrCode
    );

    return this.registrationRepo.save(registration);
  }

  async get(id: string): Promise<Registration> {
    const registration = await this.registrationRepo.findOne({
      where: { id },
      relations: ['user', 'event'],
    });
    if (!registration) throw new NotFoundException('Registration not found');
    return registration;
  }

  async findAll(
    where?: FindOptionsWhere<Registration>,
  ): Promise<Registration[]> {
    return this.registrationRepo.find({ where, relations: ['user', 'event'] });
  }

  async handleQrScan(id: string): Promise<string> {
  const registration = await this.registrationRepo.findOne({
    where: { id },
    relations: ['user', 'event'],
  });

  if (!registration) {
    return `
      <html>
      <head><title>Invalid</title></head>
      <body style="text-align: center; font-family: sans-serif;">
        <h1>Invalid QR Code</h1>
        <p>The registration could not be found.</p>
      </body>
      </html>
    `;
    }

    if (!registration.confirmed) {
      registration.confirmed = true;
      await this.registrationRepo.save(registration);
    }

  return `
    <html>
    <head>
      <title>Registration Info</title>
      <style>
        body { background: #f0f8ff; font-family: sans-serif; text-align: center; padding: 50px; }
        .message { font-size: 24px; margin-top: 20px; color: #2c3e50; }
        .event { font-size: 32px; font-weight: bold; color: #2980b9; }
        .btn { background: #4CAF50; color: #fff; padding: 12px 24px; border: none; border-radius: 6px; font-size: 18px; cursor: pointer; }
      </style>
      <script>
        async function checkIn() {
          const res = await fetch('/registration/${registration.id}/check-in', { method: 'PATCH' });
          if (res.ok) {
            document.getElementById('checkin-status').innerText = 'Checked in successfully!';
          } else {
            document.getElementById('checkin-status').innerText = 'Check-in failed.';
          }
        }
      </script>
    </head>
    <body>
      <h1>Welcome, ${registration.user.fullName}!</h1>
      <p class="message">User registered for:</p>
      <p class="event">${registration.event.title}</p>
      <button class="btn" onclick="checkIn()">Check In</button>
      <p id="checkin-status"></p>
    </body>
    </html>
  `;
}

  async checkInRegistration(id: string) {
    const registration = await this.registrationRepo.findOne({
      where: { id },
      relations: ['user', 'event'],
    });
    if (!registration) throw new NotFoundException('Registration not found');
    registration.checkedIn = true;
    await this.registrationRepo.save(registration);

    // Send thank you email after check-in
    await this.mailService.sendThankYouForParticipation(
      registration.user.email,
      registration.user.fullName,
      registration.event.title,
    );

    return registration;
  }

  async getAttendantsForEvent(eventId: string): Promise<RegistrationResponseDto[]> {
    const registrations = await this.registrationRepo.find({
      where: { event: { id: eventId }, checkedIn: true },
      relations: ['user', 'event'],
    });

    return registrations.map((registration) => ({
      id: registration.id,
      confirmed: registration.confirmed,
      createdAt: registration.createdAt,
      eventId: registration.event.id,
      user: {
        id: registration.user.id,
        fullName: registration.user.fullName,
        email: registration.user.email,
      },
      event: {
        id: registration.event.id,
        title: registration.event.title,
      },
    }));
  }

  async getExportData(eventId: string, type: 'participants' | 'attendants'): Promise<RegistrationExportDto[]> {
    const data =
      type === 'attendants'
        ? await this.getAttendantsForEvent(eventId)
        : await this.getRegistrationsForEvent(eventId);

    return data.map(r => ({
      name: r.user.fullName,
      email: r.user.email,
      confirmed: r.confirmed,
      ...(type === 'attendants' ? { checkedIn: true } : {}),
    }));
  }
}
