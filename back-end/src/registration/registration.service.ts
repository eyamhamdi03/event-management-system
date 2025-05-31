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

  ) {}

 //get all registration
 async getRegistrations(): Promise<RegistrationResponseDto[]> {
  const registrations = await this.registrationRepo.find({
    relations: ['user', 'event'] // Important: load the relations
  });

  return registrations.map(registration => {
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
    const event = await this.eventRepo.findOne({ where: { id: eventId }});

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

    const registration = this.registrationRepo.create({     user,
      event,
      confirmed: false,
  
    });
    return this.registrationRepo.save(registration);
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
  return registrations.map(registration => {
    return plainToInstance(RegistrationResponseDto, {
      ...registration,
      user: plainToInstance(UserDto, registration.user),
      event: plainToInstance(EventDto, registration.event),
    }, {
      excludeExtraneousValues: true,
    });
  });
}

async cancelRegistration(
  eventId: string,
  userId: string,               
  currentUserRole: string,      
  currentUserId: string        
) {
  // Find the registration
  const registration = await this.registrationRepo.findOne({
    where: { 
      event: { id: eventId }, 
      user: { id: userId }      
    },
    relations: ['user']         
  });

  if (!registration) {
    throw new NotFoundException('Registration not found');
  }


  if (currentUserRole !== 'organizer' && registration.user.id !== currentUserId) {
    throw new ForbiddenException('You can only cancel your own registrations');
  }

  await this.registrationRepo.remove(registration);
}
//confirm registration (update)
async confirmRegistration(id: string) {
  const registration = await this.registrationRepo.findOneBy({ id });
  if (!registration) throw new NotFoundException('Registration not found');
  registration.confirmed = true;
  await this.mailService.sendRegistrationConfirmation(
    registration.user.email,
    registration.user.fullName,
    registration.event.title,
    registration.event.eventDate.toISOString().split('T')[0] // Format date as YYYY-MM-DD
  );

  return this.registrationRepo.save(registration);
}

}
