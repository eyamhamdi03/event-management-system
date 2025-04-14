import { Injectable, ConflictException,UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service'; 
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    if (!dto) {
      throw new BadRequestException('Request body is empty');
    }
    const userExists = await this.usersService.findByfullNameOrEmail(dto.fullName, dto.email);
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
        role: 'user' ,
        phone: dto.phone,
        birthDate: dto.birthDate
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
        role: user.role};

    const jwt = await this.jwtService.sign(payload)

   return {
    "access_token": jwt
   };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // We won't reveal whether email exists for security
      return { message: 'If an account with that email exists, a reset link has been sent' };
    }

    // reset token generation
    const resetToken = this.jwtService.sign(
      { userId: user.id },
      { 
        secret: this.configService.get('JWT_RESET_SECRET'),
        expiresIn: '1h' 
      }
    );

    await this.usersService.setPasswordResetToken(user.id, resetToken);

    // Send email with reset link
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    
    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.fullName,
      resetUrl
    );

    return { message: 'If an account with that email exists, a reset link has been sent' };
  }



  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    try {
      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_RESET_SECRET')
      });

      // Check if token matches the one stored in user record
      const user = await this.usersService.findById(payload.userId);
      if (!user || user.passwordResetToken !== token) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Hash new password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password and clear reset token
      await this.usersService.updateUserPassword(user.id, hashedPassword, salt);
      await this.usersService.clearPasswordResetToken(user.id);

      return { message: 'Password successfully reset' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Password reset token has expired');
      }
      throw new BadRequestException('Invalid reset token');
    }
  }
}

  

