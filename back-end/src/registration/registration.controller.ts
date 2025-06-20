import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { Registration } from './entities/registration.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RegistrationResponseDto } from './dto/registration-response.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { MailService } from 'src/mail/mail.service';
import { Response } from 'express';
import { Parser } from 'json2csv';
import { RegistrationExportDto } from './dto/registration-export.dto';

@UseGuards(JwtAuthGuard)
@Controller('registration')
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly mailService: MailService,
  ) { }

  @Get('scan/:id')
  async scanRegistration(@Param('id') id: string, @Res() res: Response) {
    const html = await this.registrationService.handleQrScan(id);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  @Roles(Role.Admin)
  @Get()
  async getRegistrations(): Promise<RegistrationResponseDto[]> {
    return await this.registrationService.getRegistrations();
  }

  @Roles(Role.Admin)
  @Get('event/:eventId')
  async getRegistrationsByEvent(
    @Param('eventId') eventId: string,
  ): Promise<RegistrationResponseDto[]> {
    return await this.registrationService.getRegistrationsForEvent(eventId);
  }

  @Post()
  async registerToEvent(
    @Body() registrationData: CreateRegistrationDto,
  ): Promise<{ registration: Registration }> {
    const { registration } = await this.registrationService.registerToEvent(
      registrationData.eventId,
      registrationData.userId,
    );

    return { registration };
  }

  @Roles(Role.Organizer, Role.User)
  @Delete()
  async cancelRegistration(
    @Body() { eventId, userId }: { eventId: string; userId: string },
    @Req() req: any,
  ) {
    await this.registrationService.cancelRegistration(
      eventId,
      userId,
      req.user.role,
      req.user.sub,
    );
    return { message: 'Registration cancelled successfully' };
  }

  @Patch(':id/check-in')
  @Roles(Role.Admin, Role.Organizer)
  async checkIn(@Param('id') id: string): Promise<{ message: string }> {
    await this.registrationService.checkInRegistration(id);
    return { message: 'Participant checked in.' };
  }
  @Get('user/me')
  @Roles(Role.User, Role.Organizer, Role.Admin)
  async getUserRegistrations(@Req() req: any): Promise<RegistrationResponseDto[]> {
    const userId = req.user.sub;
    return await this.registrationService.getUserRegistrations(userId);
  }

}
