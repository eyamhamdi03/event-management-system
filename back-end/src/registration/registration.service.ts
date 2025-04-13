import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Registration } from './entities/registration.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Registration)
    private RegistrationRepository: Repository<Registration>,
  ) {}
  async getRegistrations(): Promise<Registration[]> {
    return await this.RegistrationRepository.find();
  }
  async AddRegistration(registration: Registration): Promise<Registration> {
    return await this.RegistrationRepository.save(registration);
  }
}
