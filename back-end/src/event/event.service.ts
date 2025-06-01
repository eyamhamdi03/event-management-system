import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { FilterEventsDto } from './dto/filter-events.dto';
import { CreateEventInput } from './dto/create-event.input';
import { EventFilterInput } from './dto/filter-event.input';
import { RegistrationService } from '../registration/registration.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';
import { Registration } from 'src/registration/entities/registration.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private EventRepository: Repository<Event>,
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    private readonly mailService: MailService,
  ) { }
  private eventCapacities: Map<string, number> = new Map();
  async getEvents(): Promise<any[]> {
    const events = await this.EventRepository.find({ relations: ['registrations'] });
    return events.map(event => {
      const currentParticipants = event.registrations.length;
      const isFull = currentParticipants >= event.participantLimit;
      return {
        ...event,
        currentParticipants,
        isFull,
      };
    });
  }
  async createEvent(input: CreateEventInput): Promise<Event> {
    const event = this.EventRepository.create(input);
    const savedEvent = await this.EventRepository.save(event);

    const max = input.maxParticipants ?? 50;
    this.eventCapacities.set(savedEvent.id, max);

    return savedEvent;
  }
  async getEventById(id: string): Promise<any> {
    const event = await this.EventRepository.findOne({
      where: { id },
      relations: ['registrations'],
    });
    if (!event) throw new NotFoundException('Event with this id ${id} not found');

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
    return await this.EventRepository.save(updated);
  }
  async updateEvent(id: string, partialEvent: Partial<Event>): Promise<Event> {
    await this.EventRepository.update(id, partialEvent);
    return this.getEventById(id);
  }

  async deleteEvent(id: string): Promise<void> {
    const result = await this.EventRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }
  async softRemoveEvent(id: string): Promise<void> {
    const event = await this.getEventById(id);
    await this.EventRepository.softRemove(event);
  }
  async restoreEvent(id: string): Promise<void> {
    const result = await this.EventRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Event with ID ${id} not found or not soft deleted`,
      );
    }
  }
  findAll(): Promise<Event[]> {
    return this.EventRepository.find({
      relations: ['organizer', 'categories', 'registrations']
    });
  }

  async findById(id: string): Promise<Event> {
    const event = await this.EventRepository.findOne({
      where: { id },
      relations: ['category', 'registrations']
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  findByCategoryId(categoryId: string): Promise<Event[]> {
    return this.EventRepository.find({
      where: { category: { id: categoryId } }
    });
  }

  //////filter////
  async findAllFiltered(filter: FilterEventsDto): Promise<{ data: Event[], total: number }> {
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

    const query = this.EventRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.host', 'host')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.registrations', 'registrations');

    if (category) {
      query.andWhere('category.name = :category', { category });
    }

    if (search) {
      query.andWhere('(event.title ILIKE :search OR event.description ILIKE :search)', {
        search: `%${search}%`,
      });
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
    const events = await this.EventRepository.find({ relations: ['category', 'registrations'] });

    const filteredEvents = await Promise.all(
      events.map(async (event) => {
        if (filter.id && event.id !== filter.id) return null;
        if (filter.title && !event.title.toLowerCase().includes(filter.title.toLowerCase())) return null;
        if (filter.categoryId && event.category?.id !== filter.categoryId) return null;
        if (filter.startDate && new Date(event.eventDate) < new Date(filter.startDate)) return null;
        if (filter.endDate && new Date(event.eventDate) > new Date(filter.endDate)) return null;

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
    const events = await this.EventRepository.find({
      where: {
        eventDate: Between(
          new Date(in24h.getTime() - 30 * 60 * 1000), // 30min window
          new Date(in24h.getTime() + 30 * 60 * 1000)
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
          event.eventDate.toISOString().split('T')[0]
        );
      }
    }
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const today = new Date();
    return this.EventRepository.find({
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


