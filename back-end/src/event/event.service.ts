import { Injectable } from '@nestjs/common';
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
}
