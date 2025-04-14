import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
  ) {}


  createUser({ fullName, email, password,salt,role,phone,birthDate }: { fullName: string; email: string; password: string,salt:string,role:string,phone:number,birthDate:Date }): Promise<User> {
    const user = this.UserRepository.create({ fullName, email, password,salt,role,phone,birthDate });
    return this.UserRepository.save(user);
  }

  async getUsers(): Promise<User[]> {
    return await this.UserRepository.find();
  }

  findByfullName(fullName: string): Promise<User |null> {
    return this.UserRepository.findOne({ where: { fullName } });
  }

  async findByfullNameOrEmail(fullName: string, email: string): Promise<User | null> {
    return this.UserRepository.findOne({
      where: [{ fullName }, { email }],
    });

  }

  async findById(id: string): Promise<User | null> {
    return this.UserRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.UserRepository.findOne({ where: { email } });
  }

  async setPasswordResetToken(userId: string, token: string): Promise<void> {
    await this.UserRepository.update(userId, { passwordResetToken: token });
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await this.UserRepository.update(userId, { passwordResetToken: null });
  }

  async updateUserPassword(userId: string, newPassword: string, newSalt: string): Promise<void> {
    await this.UserRepository.update(userId, { 
      password: newPassword,
      salt: newSalt
    });

  }

}
