import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';

import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { EventFilterInput } from './dto/filter-event.input';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';
import { Registration } from 'src/registration/entities/registration.entity';

import { FilterEventsDto } from './dto/filter-events.dto';
import NotificationsService from '../notifications/notifications.service';
import { User } from '../user/entities/user.entity';
import { NotificationType } from '../notifications/dto/notification.dto';
import { Role } from 'src/auth/roles.enum';
@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private EventRepository: Repository<Event>,
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    private notifications: NotificationsService,
     @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    private readonly mailService: MailService,

  ) {}
    private eventCapacities: Map<string, number> = new Map();

  async getEvents(): Promise<Event[]> {
     const events = await this.EventRepository.find({
      relations: ['registrations'],
    });
    return events.map((event) => {
      const currentParticipants = event.registrations.length;
      const isFull = currentParticipants >= event.participantLimit;
      return {
        ...event,
        currentParticipants,
        isFull,
      };
  });}

  private async notifyRegisteredUsers(
    event: Event,
    type: NotificationType,
    message: string,
  ): Promise<void> {
    const fullEvent = await this.EventRepository.findOne({
      where: { id: event.id },
      relations: ['registrations', 'registrations.user'],
    });

    if (!fullEvent || !fullEvent.registrations) return;
    const adminUsers = await this.UserRepository.find({
      where: { role: Role.Admin },
    });
    //notify all admin users and registered users
    for (const admin of adminUsers) {
      this.notifications.sendToUser(admin.id, {
        type,
        message,
        data: { eventId: event.id },
      });
      for (const registration of fullEvent.registrations) {
        const user = registration.user;
        if (user) {
          this.notifications.sendToUser(user.id, {
            type,
            message,
            data: { eventId: event.id },
          });
        }
      }
    }
  }

  async createEvent(event: Event): Promise<Event> {
    const eventCreated = await this.EventRepository.save(event);
    const users = await this.UserRepository.find();
    for (const user of users) {
      this.notifications.sendToUser(user.id, {
        type: NotificationType.EVENT_CREATED,
        message: `A new event "${eventCreated.title}" has been created.`,
        data: { eventId: eventCreated.id },
      });
    }
    return eventCreated;
  }
  async getEventById(id: string): Promise<any> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['registrations'],
    });
    if (!event)
      throw new NotFoundException('Event with this id ${id} not found');

    const currentParticipants = event.registrations.length;
    const isFull = currentParticipants >= event.participantLimit;

    return {
      ...event,
      currentParticipants,
      isFull,
    };
  }

  async replaceEvent(id: string, newEvent: Event): Promise<Event> {
    const existing = await this.getEventById(id);
    const updated = { ...existing, ...newEvent, id: existing.id };
    return await this.eventRepository.save(updated);
  }
  async updateEvent(id: string, partialEvent: Partial<Event>): Promise<Event> {
    await this.EventRepository.update(id, partialEvent);
    const updatedEvent = await this.getEventById(id);

    await this.notifyRegisteredUsers(
      updatedEvent,
      NotificationType.EVENT_UPDATED,
      `The event "${updatedEvent.title}" has been updated.`,
    );

    return updatedEvent;
  }
  async findByHostId(userId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { host: { id: userId } },
      order: { eventDate: 'ASC' },
    });
  }

  async deleteEvent(id: string): Promise<void> {
    const result = await this.eventRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }
  async softRemoveEvent(id: string): Promise<void> {
    const event = await this.getEventById(id);
    await this.EventRepository.softRemove(event);
    await this.notifyRegisteredUsers(
      event,
      NotificationType.EVENT_CANCELLATION,
      `The event "${event.title}" has been cancelled.`,
    );
  }

  async restoreEvent(id: string): Promise<void> {
    const result = await this.eventRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Event with ID ${id} not found or not soft deleted`,
      );
    }
    const resultEvent = await this.EventRepository.findOne({
      where: { id },
    });
    if (resultEvent) {
      await this.notifyRegisteredUsers(
        resultEvent,
        NotificationType.EVENT_RESTORED,
        `The event "${resultEvent.title}" has been rescheduled.`,
      );
    }
  }
  findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['organizer', 'categories', 'registrations'],
    });
  }

  async findById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['category', 'registrations'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  findByCategoryId(categoryId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  //////filter////
  async findAllFiltered(
    filter: FilterEventsDto,
  ): Promise<{ data: Event[]; total: number }> {
  async findAllFiltered(
    filter: FilterEventsDto,
  ): Promise<{ data: Event[]; total: number }> {
    const {
      category,
      search,
      date,
      startDate,
      endDate,
      hostId,
      upcoming,
      page = '1',
      limit = '10',
    } = filter;

    const query = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.host', 'host')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.registrations', 'registrations');

    if (category) {
      query.andWhere('category.name = :category', { category });
    }

    if (search) {
      query.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
      query.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (date) {
      query.andWhere('DATE(event.eventDate) = :date', { date });
    }


    if (startDate && endDate) {
      query.andWhere('event.eventDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }


    if (upcoming === 'true') {
      query.andWhere('event.eventDate >= :today', { today: new Date() });
    }

    if (hostId) {
      query.andWhere('host.id = :hostId', { hostId: parseInt(hostId) });
    }

    // Pagination
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [data, total] = await query
      .take(take)
      .skip(skip)
      .orderBy('event.eventDate', 'ASC')
      .getManyAndCount();

    return { data, total };
  }
}
