import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {Role} from 'src/auth/roles.enum';
import { NotFoundException, BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
  ) {}

  createUser({
    fullName,
    email,
    password,
    salt,
    role,
    phone,
    birthDate,
    emailVerified,
    provider,
    avatar,
  }: {
    fullName: string;
    email: string;
    password: string;
    salt: string;
    role: Role;
    phone: number;
    birthDate: Date;
    emailVerified: boolean;
    provider : string;
    avatar : string;
  }): Promise<User> {
    const user = this.UserRepository.create({
      fullName,
      email,
      password,
      salt,
      role,
      phone,
      birthDate,
      emailVerified,
      provider,
      avatar,
    });
    return this.UserRepository.save(user);
  }

  async getUsers(): Promise<User[]> {
    return await this.UserRepository.find();
  }

  findByfullName(fullName: string): Promise<User | null> {
    return this.UserRepository.findOne({ where: { fullName } });
  }

  async findByfullNameOrEmail(
    fullName: string,
    email: string,
  ): Promise<User | null> {
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

  async updateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.UserRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.refreshToken = refreshToken;
    await this.UserRepository.save(user);
  }
  
  async updateEmailVerificationToken(userId: string, token: string) {
    return this.UserRepository.update(userId, {
      emailVerificationToken: token,
    });
  }
  
  async markEmailVerified(userId: string) {
    return this.UserRepository.update(userId, {
      emailVerified: true,
      emailVerificationToken: "",
    });
  }
  
  async deleteUser(userId: string): Promise<{ message: string }> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
  
    const deleteResult = await this.UserRepository.delete({ id: userId });
    
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  
    return { message: 'User deleted successfully' };
  }
}
  

