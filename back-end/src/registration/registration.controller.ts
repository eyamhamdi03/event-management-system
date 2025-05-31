import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
@UseGuards(JwtAuthGuard)
@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService
  , private readonly mailService: MailService
  ) {}

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
  ): Promise<{ registration: Registration; qrcode: string }> {
    const { registration, qrcode } =
      await this.registrationService.registerToEvent(
        registrationData.eventId,
        registrationData.userId,
      );

    return { registration, qrcode };
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
      req.user.id,
    );
    return { message: 'Registration cancelled successfully' };
  }
  
  @Patch('confirm/:id')
  async confirmRegistration(
    @Param('id') id: string,
  ): Promise<Registration> {
    const registration = await this.registrationService.get(id);
    const { user, event } = registration;
    await this.mailService.sendRegistrationConfirmation(
      user.email,
      user.fullName,
      event.title,
      event.eventDate.toISOString()
   
  );
  async confirmRegistration(@Param('id') id: string): Promise<Registration> {
    return await this.registrationService.confirmRegistration(id);
  }
}
