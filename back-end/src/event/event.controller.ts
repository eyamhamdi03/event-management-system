import {Body,Controller,Delete,Get,Param,Patch,Post,Put,} from '@nestjs/common';
import { Event } from './entities/event.entity';

import { UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum'; 
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  async getEvents(): Promise<Event[]> {
    return await this.eventService.getEvents();
  }

  @Get(':id')
  async getEventById(@Param('id') id: string): Promise<Event> {
    return await this.eventService.getEventById(id);
  }

  @Post()
  async createEvent(@Body() event: Event): Promise<Event> {
    return await this.eventService.createEvent(event);
  }

  @Put(':id')
  async replaceEvent(
    @Param('id') id: string,
    @Body() event: Event,
  ): Promise<Event> {
    return await this.eventService.replaceEvent(id, event);
  }

  @Patch(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() partialEvent: Partial<Event>,
  ): Promise<Event> {
    return await this.eventService.updateEvent(id, partialEvent);
  }
  @Delete('soft/:id')
  async softDelete(@Param('id') id: string): Promise<void> {
    return await this.eventService.softRemoveEvent(id);
  }

  @Post('restore/:id')
  async restore(@Param('id') id: string): Promise<void> {
    return this.eventService.restoreEvent(id);
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string): Promise<void> {
    return await this.eventService.deleteEvent(id);
  }
}
