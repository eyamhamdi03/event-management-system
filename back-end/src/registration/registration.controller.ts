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
  UseGuards,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { Registration } from './entities/registration.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RegistrationResponseDto } from './dto/registration-response.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@UseGuards(JwtAuthGuard)
@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

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

  @Roles(Role.Organizer)
  @Post()
  async registerToEvent(
    @Body() registrationData: CreateRegistrationDto,
  ): Promise<Registration> {
    return await this.registrationService.registerToEvent(
      registrationData.eventId,
      registrationData.userId,
    );
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
  @Roles(Role.Organizer)
  @Patch('confirm/:id')
  async confirmRegistration(@Param('id') id: string): Promise<Registration> {
    return await this.registrationService.confirmRegistration(id);
  }
}
