import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { FilterEventsDto } from './dto/filter-events.dto';
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
  ) {}
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
  async createEvent(eventDto: CreateEventDto): Promise<Event> {
    const event = this.EventRepository.create(eventDto);
    return this.EventRepository.save(event);
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


