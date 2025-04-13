import { Controller, Get } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { Registration } from './entities/registration.entity';

@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}
  @Get()
  async getAllRegistrations(): Promise<Registration[]> {
    return await this.registrationService.getRegistrations();
  }
}
