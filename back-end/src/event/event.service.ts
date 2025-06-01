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

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    private readonly mailService: MailService,
  ) {}
  private eventCapacities: Map<string, number> = new Map();
  async getEvents(): Promise<any[]> {
    const events = await this.eventRepository.find({
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
    });
  }
  async createEvent(eventDto: CreateEventDto): Promise<Event> {
    const { hostId, categoryId, ...eventData } = eventDto;

    // Fetch related entities
    const host = await this.userRepository.findOne({ where: { id: hostId } });
    if (!host) throw new NotFoundException('Host not found');

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    // Create and save event
    const event = this.eventRepository.create({
      ...eventData,
      host,
      category,
    });
    const savedEvent = await this.eventRepository.save(event);

    return savedEvent;
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
  async updateEvent(
    id: string,
    partialEvent: Partial<Event>,
    userId: string,
  ): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['host'],
    });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);

    if (event.host.id !== userId) {
      throw new ForbiddenException('You are not allowed to update this event');
    }

    await this.eventRepository.update(id, partialEvent);
    return this.getEventById(id);
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
    await this.eventRepository.softRemove(event);
  }
  async restoreEvent(id: string): Promise<void> {
    const result = await this.eventRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Event with ID ${id} not found or not soft deleted`,
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
  async filterEvents(filter: EventFilterInput): Promise<Event[]> {
    const events = await this.eventRepository.find({
      relations: ['category', 'registrations'],
    });

    const filteredEvents = await Promise.all(
      events.map(async (event) => {
        if (filter.id && event.id !== filter.id) return null;
        if (
          filter.title &&
          !event.title.toLowerCase().includes(filter.title.toLowerCase())
        )
          return null;
        if (filter.categoryId && event.category?.id !== filter.categoryId)
          return null;
        if (
          filter.startDate &&
          new Date(event.eventDate) < new Date(filter.startDate)
        )
          return null;
        if (
          filter.endDate &&
          new Date(event.eventDate) > new Date(filter.endDate)
        )
          return null;

        if (filter.isAvailable !== undefined) {
          const registrations = event.registrations ?? [];
          const maxCapacity = this.eventCapacities.get(event.id) ?? 50;
          const isAvailable = registrations.length < maxCapacity;
          if (isAvailable !== filter.isAvailable) return null;
        }

        return event;
      }),
    );

    return filteredEvents.filter((e): e is Event => e !== null);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sendEventReminders() {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const events = await this.eventRepository.find({
      where: {
        eventDate: Between(
          new Date(in24h.getTime() - 30 * 60 * 1000), // 30min window
          new Date(in24h.getTime() + 30 * 60 * 1000),
        ),
      },
      relations: ['registrations', 'registrations.user'],
    });
    for (const event of events) {
      for (const reg of event.registrations) {
        await this.mailService.sendEventReminder(
          reg.user.email,
          reg.user.fullName,
          event.title,
          event.eventDate.toISOString().split('T')[0],
        );
      }
    }
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const today = new Date();
    return this.eventRepository.find({
      where: {
        eventDate: MoreThanOrEqual(today),
      },
      order: {
        eventDate: 'ASC',
      },
      relations: ['registrations'],
    });
  }
}
