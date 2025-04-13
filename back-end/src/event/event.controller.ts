import { Controller, Get } from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getEvents(): Promise<Event[]> {
    return await this.eventService.getEvents();
  }
}
