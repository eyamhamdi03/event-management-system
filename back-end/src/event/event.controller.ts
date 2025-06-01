import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { Event } from './entities/event.entity';
import { EventService } from './event.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilterEventsDto } from './dto/filter-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from '../user/entities/user.entity';
import { Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('event')
@UseGuards(JwtAuthGuard)
@SkipThrottle()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('mine')
  @Roles(Role.Organizer)
  @Throttle({ default: { limit: 30, ttl: 60 } }) // 30 requests/min
  async getMyEvents(@Req() req: Request): Promise<Event[]> {
    const user = req.user as { id: string };
    return this.eventService.findByHostId(user.id);
  }

  //Get Filter//

  @Get('/withFilter')
  async getFilteredEvents(@Query() filter: FilterEventsDto) {
    return this.eventService.findAllFiltered(filter);
  }
  @Get()
  @Roles(Role.Admin)
  @Throttle({ default: { limit: 30, ttl: 60 } }) // 30 requests/min
  async getEvents(): Promise<Event[]> {
    return await this.eventService.getEvents();
  }

  @Get(':id')
  @Public()
  @Throttle({ default: { limit: 60, ttl: 60 } }) // 60 requests/min
  async getEventById(@Param('id') id: string): Promise<Event> {
    return await this.eventService.getEventById(id);
  }

  @Post()
  @Roles(Role.Admin, Role.Organizer)
  @Throttle({ default: { limit: 10, ttl: 60 } }) // 10 requests/min
  async createEvent(@Body() eventDto: CreateEventDto): Promise<Event> {
    return this.eventService.createEvent(eventDto);
  }

  @Put(':id')
  @Roles(Role.Admin, Role.Organizer)
  @Throttle({ default: { limit: 10, ttl: 60 } }) // 10 requests/min
  async replaceEvent(
    @Param('id') id: string,
    @Body() event: Event,
  ): Promise<Event> {
    return await this.eventService.replaceEvent(id, event);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Organizer)
  @Throttle({ default: { limit: 20, ttl: 60 } }) // 20 requests/min
  async updateEvent(
    @Param('id') id: string,
    @Body() partialEvent: Partial<Event>,
    @Req() req: Request,
  ): Promise<Event> {
    const user = req.user as User;
    const userId = user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'User information is missing from request.',
      );
    }
    return this.eventService.updateEvent(id, partialEvent, userId);
  }

  @Delete('soft/:id')
  @Roles(Role.Admin, Role.Organizer)
  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 requests/min
  async softDeleteEvent(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const user = req.user as User;
    const userId = user?.id;
    const userRole = user?.role;

    if (!userId || !userRole) {
      throw new UnauthorizedException(
        'User information is missing from request.',
      );
    }
    await this.eventService.softRemoveEvent(id);
  }

  @Post('restore/:id')
  @Roles(Role.Admin)
  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 requests/min
  async restore(@Param('id') id: string): Promise<void> {
    return this.eventService.restoreEvent(id);
  }

  @Delete(':id')
  @Roles(Role.Admin) // Only admins can hard delete
  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests/min
  async deleteEvent(@Param('id') id: string): Promise<void> {
    return await this.eventService.deleteEvent(id);
  }
}
