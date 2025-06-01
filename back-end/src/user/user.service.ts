import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../auth/roles.enum';
import {
  NotFoundException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { Like } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SocialProvider } from '../auth/socialProviders.enum';
import { JwtPayload } from 'jsonwebtoken';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private UserRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const salt = createUserDto.salt || (await bcrypt.genSalt());
    const password = createUserDto.salt
      ? createUserDto.password
      : await bcrypt.hash(createUserDto.password, salt);

    const userPartial: Partial<User> = {
      ...createUserDto,
      password,
      salt,
      role: createUserDto.role || Role.User,
      phone: createUserDto.phone || 0,
      birthDate: createUserDto.birthDate || new Date(),
      emailVerified: createUserDto.emailVerified || false,
      provider: createUserDto.provider || SocialProvider.Local,
      avatar: createUserDto.avatar || '',
    };

    // Create and save with proper typing
    const user = this.UserRepository.create(userPartial);
    return await this.UserRepository.save(user);
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

  async findOne(id: string): Promise<User | null> {
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

  async updateUserPassword(
    userId: string,
    newPassword: string,
    newSalt: string,
  ): Promise<void> {
    await this.UserRepository.update(userId, {
      password: newPassword,
      salt: newSalt,
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
      emailVerificationToken: '',
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

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.UserRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: 'User soft deleted successfully' };
  }

  async restore(id: string): Promise<{ message: string }> {
    const result = await this.UserRepository.restore(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `User with ID ${id} not found or not deleted`,
      );
    }

    return { message: 'User restored successfully' };
  }

  async findAll(): Promise<User[]> {
    return this.UserRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.UserRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
      updateUserDto.salt = salt;
    }

    Object.assign(user, updateUserDto);
    return this.UserRepository.save(user);
  }

  async searchUsers(email?: string, fullName?: string): Promise<User[]> {
    const where: any = {};
    if (email) where.email = Like(`%${email}%`);
    if (fullName) where.fullName = Like(`%${fullName}%`);

    return this.UserRepository.find({ where });
  }

  async getUserProfile(
    id: string,
    requestingUser: { sub: string; role: Role },
  ): Promise<Partial<User>> {
    this.validateUserAccess(id, requestingUser);
    const user = await this.UserRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.sanitizeUser(user);
  }

  async updateUserProfile(
    id: string,
    updateUserDto: UpdateUserDto,
    requestingUser: { sub: string; role: Role },
  ): Promise<Partial<User>> {
    this.validateUserAccess(id, requestingUser);

    const user = await this.UserRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(updateUserDto.password, salt);
      user.salt = salt;
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.UserRepository.save(user);
    return this.sanitizeUser(updatedUser);
  }

  private validateUserAccess(
    targetUserId: string,
    requestingUser: { sub: string; role: Role },
  ): void {
    if (
      requestingUser.role !== Role.Admin &&
      requestingUser.sub !== targetUserId
    ) {
      throw new UnauthorizedException('You can only access your own profile');
    }
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, salt, refreshToken, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
