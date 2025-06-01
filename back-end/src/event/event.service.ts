import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './entities/event.entity';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { Registration } from '../registration/entities/registration.entity';
import { MailService } from '../mail/mail.service';
import NotificationsService from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/notification.dto';
import { Role } from '../auth/roles.enum';
import { FilterEventsDto } from './dto/filter-events.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,

    private readonly notifications: NotificationsService,
    private readonly mailService: MailService,
  ) {}

  private readonly eventCapacities: Map<string, number> = new Map();

  async getEvents(): Promise<Event[]> {
    const events = await this.eventRepository.find({
      relations: ['registrations'],
    });

    return events.map((event) => {
      const currentParticipants = event.registrations.length;
      const isFull = currentParticipants >= event.participantLimit;
      return { ...event, currentParticipants, isFull } as Event & {
        currentParticipants: number;
        isFull: boolean;
      };
    });
  }

  async getEventById(
    id: string,
  ): Promise<Event & { currentParticipants: number; isFull: boolean }> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['registrations'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const currentParticipants = event.registrations.length;
    const isFull = currentParticipants >= event.participantLimit;

    return { ...event, currentParticipants, isFull };
  }

  async createEvent(event: Event): Promise<Event> {
    const created = await this.eventRepository.save(event);

    // Notify every user that a new event has been created
    const users = await this.userRepository.find();
    for (const user of users) {
      this.notifications.sendToUser(user.id, {
        type: NotificationType.EVENT_CREATED,
        message: `A new event "${created.title}" has been created.`,
        data: { eventId: created.id },
      });
    }

    return created;
  }

  async replaceEvent(id: string, newEvent: Event): Promise<Event> {
    const existing = await this.getEventById(id);
    const updated = { ...existing, ...newEvent, id: existing.id } as Event;

    return this.eventRepository.save(updated);
  }

  async updateEvent(id: string, partialEvent: Partial<Event>): Promise<Event> {
    await this.eventRepository.update(id, partialEvent);
    const updatedEvent = await this.getEventById(id);

    await this.notifyRegisteredUsers(
      updatedEvent,
      NotificationType.EVENT_UPDATED,
      `The event "${updatedEvent.title}" has been updated.`,
    );

    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    const { affected } = await this.eventRepository.delete(id);

    if (!affected) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async softRemoveEvent(id: string): Promise<void> {
    const event = await this.getEventById(id);

    await this.eventRepository.softRemove(event);
    await this.notifyRegisteredUsers(
      event,
      NotificationType.EVENT_CANCELLATION,
      `The event "${event.title}" has been cancelled.`,
    );
  }

  async restoreEvent(id: string): Promise<void> {
    const { affected } = await this.eventRepository.restore(id);

    if (!affected) {
      throw new NotFoundException(
        `Event with ID ${id} not found or not soft‑deleted`,
      );
    }

    const restored = await this.eventRepository.findOne({ where: { id } });
    if (restored) {
      await this.notifyRegisteredUsers(
        restored,
        NotificationType.EVENT_RESTORED,
        `The event "${restored.title}" has been rescheduled.`,
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

  findByHostId(userId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { host: { id: userId } },
      order: { eventDate: 'ASC' },
    });
  }

  findByCategoryId(categoryId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { category: { id: categoryId } },
    });
  }

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
        { search: `%${search}%` },
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
      query.andWhere('host.id = :hostId', { hostId });
    }

    // Pagination
    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [data, total] = await query
      .orderBy('event.eventDate', 'ASC')
      .take(take)
      .skip(skip)
      .getManyAndCount();

    return { data, total };
  }

  private async notifyRegisteredUsers(
    event: Event,
    type: NotificationType,
    message: string,
  ): Promise<void> {
    const fullEvent = await this.eventRepository.findOne({
      where: { id: event.id },
      relations: ['registrations', 'registrations.user'],
    });

    if (!fullEvent || !fullEvent.registrations) return;

    // Notify admins first
    const admins = await this.userRepository.find({
      where: { role: Role.Admin },
    });
    for (const admin of admins) {
      this.notifications.sendToUser(admin.id, {
        type,
        message,
        data: { eventId: event.id },
      });
    }

    // Then notify registered users
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
