import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto) {
      throw new BadRequestException('Request body is empty');
    }
    const userExists = await this.usersService.findByfullNameOrEmail(
      dto.fullName,
      dto.email,
    );
    if (userExists) {
      throw new ConflictException('fullName or email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const { fullName, email } = dto;
    const user = await this.usersService.createUser({
      fullName,
      email,
      password: hashedPassword,
      salt: salt,
      role: 'user',
      phone: dto.phone,
      birthDate: dto.birthDate,
    });

    const { password: _, salt: __, ...result } = user;
    return result;
  }

  async login(credentials: LoginDto) {
    const { fullName, password } = credentials;

    const user = await this.usersService.findByfullName(credentials.fullName);
    if (!user) throw new NotFoundException('Invalid credentials');

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    const jwt = await this.jwtService.sign(payload);

    return {
      access_token: jwt,
    };
  }
}
