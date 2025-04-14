import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private EventRepository: Repository<Event>,
  ) {}
  async getEvents(): Promise<Event[]> {
    return await this.EventRepository.find();
  }
  async createEvent(event: Event): Promise<Event> {
    return await this.EventRepository.save(event);
  }
  async getEventById(id: string): Promise<Event> {
    const event = await this.EventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
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
}
