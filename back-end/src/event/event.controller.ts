import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Res, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

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
import { RegistrationService } from '../registration/registration.service';
import { RegistrationResponseDto } from '../registration/dto/registration-response.dto';
import { RegistrationExportDto } from '../registration/dto/registration-export.dto';
import { Response } from 'express';
import { Parser } from 'json2csv';

@Controller('event')
@UseGuards(JwtAuthGuard)
@SkipThrottle()
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly registrationService: RegistrationService,
  ) { }

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
      throw new UnauthorizedException('User information is missing from request.');
    }
    return await this.eventService.updateEvent(id, partialEvent, userId);

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
  @Roles(Role.Admin)
  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests/min
  async deleteEvent(@Param('id') id: string): Promise<void> {
    return await this.eventService.deleteEvent(id);
  }

  @Roles(Role.Admin, Role.Organizer)
  @Get(':eventId/participants')
  async getEventParticipants(
    @Param('eventId') eventId: string,
  ): Promise<RegistrationResponseDto[]> {
    return await this.registrationService.getRegistrationsForEvent(eventId);
  }

  @Roles(Role.Admin, Role.Organizer)
  @Get(':eventId/attendants')
  async getEventAttendants(
    @Param('eventId') eventId: string,
  ): Promise<RegistrationResponseDto[]> {
    return await this.registrationService.getAttendantsForEvent(eventId);
  }

  @Roles(Role.Admin, Role.Organizer)
  @Get(':eventId/export-participants')
  async exportParticipants(
    @Param('eventId') eventId: string,
    @Res() res: Response,
  ) {
    const exportData: RegistrationExportDto[] =
      await this.registrationService.getExportData(eventId, 'participants');
    const parser = new Parser();
    const csv = parser.parse(exportData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`event-${eventId}-participants.csv`);
    return res.send(csv);
  }

  @Roles(Role.Admin, Role.Organizer)
  @Get(':eventId/export-attendants')
  async exportAttendants(
    @Param('eventId') eventId: string,
    @Res() res: Response,
  ) {
    const exportData: RegistrationExportDto[] =
      await this.registrationService.getExportData(eventId, 'attendants');
    const parser = new Parser();
    const csv = parser.parse(exportData);
    res.header('Content-Type', 'text/csv');
    res.attachment(`event-${eventId}-attendants.csv`);
    return res.send(csv);
  }
}
