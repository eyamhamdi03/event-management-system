import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { FilterEventsDto } from './dto/filter-events.dto';
import { Role } from 'src/auth/roles.enum';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getEvents(): Promise<any[]> {
    const events = await this.eventRepository.find({ relations: ['registrations'] });
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
    const { hostId, categoryId, ...eventData } = eventDto;

    // Fetch related entities
    const host = await this.userRepository.findOne({ where: { id: hostId } });
    if (!host) throw new NotFoundException('Host not found');

    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    // Create and save event
    const event = this.eventRepository.create({
      ...eventData,
      host,
      category,
    });

    return await this.eventRepository.save(event);
  }
  async getEventById(id: string): Promise<any> {
    const event = await this.eventRepository.findOne({
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
    return await this.eventRepository.save(updated);
  }
  async updateEvent(id: string, partialEvent: Partial<Event>, userId: string): Promise<Event> {
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

    const query = this.eventRepository.createQueryBuilder('event')
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

  async softDeleteEvent(id: string, userId: string, userRole: Role): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['host'],
    });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);

    // Only admin or the host can delete
    if (userRole !== Role.Admin && event.host.id !== userId) {
      throw new ForbiddenException('You are not allowed to delete this event');
    }

    await this.eventRepository.softDelete(id);
  }
}


