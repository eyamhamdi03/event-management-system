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

  //get all registration
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

  //post registration
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

  // get resgistration by event id
  async getRegistrationsForEvent(
    eventId: string,
  ): Promise<RegistrationResponseDto[]> {
    const registrations = await this.registrationRepo.find({
      where: { event: { id: eventId } },
      relations: ['user', 'event'], // Make sure to include both relations
    });

    // Transform each registration and its relations
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
    // Find the registration
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
//confirm registration (update)
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
      <title>Registration Confirmed</title>
      <style>
        body {
          background: #f0f8ff;
          font-family: sans-serif;
          text-align: center;
          padding: 50px;
        }
        .message {
          font-size: 24px;
          margin-top: 20px;
          color: #2c3e50;
        }
        .event {
          font-size: 32px;
          font-weight: bold;
          color: #2980b9;
        }
      </style>
    </head>
    <body>
      <h1>Welcome, ${registration.user.fullName}!</h1>
      <p class="message">User registered for:</p>
      <p class="event">${registration.event.title}</p>
      <p>Enjoy the event!</p>
    </body>
    </html>
  `;
  }
}
