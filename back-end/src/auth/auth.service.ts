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
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { Role } from '../auth/roles.enum';
import { User } from 'src/user/entities/user.entity';
import { SocialProvider } from './socialProviders.enum';
import { SocialUserDto } from './dto/social-user.dto';
import { AuthResultDto } from './dto/auth-result.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
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
      role: Role.User,
      phone: dto.phone,
      birthDate: dto.birthDate,
      emailVerified: false,
      provider: SocialProvider.Local,
      avatar: dto.avatar || '',
    });

    const emailVerificationToken = this.jwtService.sign(
      { userId: user.id },
      {
        secret: this.configService.get('JWT_VERIFY_SECRET'),
        expiresIn: '1d',
      },
    );

    // Save the token to the user
    await this.usersService.updateEmailVerificationToken(
      user.id,
      emailVerificationToken,
    );

    // Send verification email
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${emailVerificationToken}`;
    await this.mailService.sendVerificationEmail(
      email,
      fullName,
      verificationUrl,
    );

    const {
      password: _,
      salt: __,
      emailVerificationToken: ___,
      ...result
    } = user;
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

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // We won't reveal whether email exists for security
      return {
        message:
          'If an account with that email exists, a reset link has been sent',
      };
    }

    // reset token generation
    const resetToken = this.jwtService.sign(
      { userId: user.id },
      {
        secret: this.configService.get('JWT_RESET_SECRET'),
        expiresIn: '1h',
      },
    );

    await this.usersService.setPasswordResetToken(user.id, resetToken);

    // Send email with reset link
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.fullName,
      resetUrl,
    );

    return {
      message:
        'If an account with that email exists, a reset link has been sent',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    try {
      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_RESET_SECRET'),
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

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_VERIFY_SECRET'),
      });
      console.log('Decoded payload:', payload);

      const user = await this.usersService.findById(payload.userId);
      if (!user) throw new NotFoundException('User not found');
      if (user.emailVerified) return { message: 'Email already verified' };

      if (user.emailVerificationToken !== token) {
        throw new UnauthorizedException('Invalid token');
      }

      //await this.usersService.clearEmailVerificationToken(user.id);

      await this.usersService.markEmailVerified(user.id);
      return { message: 'Email successfully verified' };
    } catch (e) {
      console.error('Token verification failed:', e.message);
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async validateSocialUser(user: SocialUserDto): Promise<AuthResultDto> {
    // Normalize email to lowercase to avoid case sensitivity issues
    const normalizedEmail = user.email.toLowerCase();

    // Check if user exists
    let existingUser = await this.usersService.findByEmail(normalizedEmail);

    if (!existingUser) {
      existingUser = await this.createSocialUser(user);
    }

    return this.generateAuthTokens(existingUser);
  }

  private async createSocialUser(user: SocialUserDto) {
    const fullName = `${user.firstName} ${user.lastName}`.trim();

    return this.usersService.createUser({
      fullName,
      email: user.email.toLowerCase(),
      password: '',
      salt: '',
      role: Role.User,
      birthDate: new Date(),
      phone: 0,
      emailVerified: true,
      provider: SocialProvider.Local,
      avatar: user.picture || '',
    });
  }

  private generateAuthTokens(user: User): AuthResultDto {
    const payload = {
      sub: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async handleGoogleRedirect(socialUser: any): Promise<string> {
    if (!socialUser) {
      throw new Error('Social authentication failed');
    }

    const { email, firstName, lastName, provider, picture } = socialUser;
    const result = await this.validateSocialUser({
      email,
      firstName,
      lastName,
      picture,
      provider,
    });

    const frontendUrl = this.configService.get('FRONTEND_URL');
    return `${frontendUrl}/auth/callback?token=${result.access_token}`;
  }

  async handleGoogleAuthCallback(
    req: Request,
  ): Promise<{ redirectUrl: string }> {
    const user = (req as any).user as SocialUserDto;
    if (!user) {
      return {
        redirectUrl: `${this.configService.get('FRONTEND_URL')}/login?error=social_auth_failed`,
      };
    }

    try {
      const result = await this.validateSocialUser({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        provider: SocialProvider.Google,
      });

      return {
        redirectUrl: `${this.configService.get('FRONTEND_URL')}/auth/callback?token=${result.access_token}`,
      };
    } catch (error) {
      return {
        redirectUrl: `${this.configService.get('FRONTEND_URL')}/login?error=auth_failed`,
      };
    }
  }

  async refreshTokens(refreshToken: string) {
    if (this.isTokenRevoked(refreshToken)) {
      throw new UnauthorizedException('Token revoked');
    }
    try {
      // Verify and decode the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Get user and validate
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Validate against stored hash
      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Refresh token mismatch');
      }

      // ====== NEW: ROTATION LOGIC ======
      // 1. Invalidate old token FIRST
      await this.usersService.updateRefreshToken(user.id, '');

      // 2. Generate new tokens
      const newPayload = { sub: user.id, email: user.email, role: user.role };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      });

      // 3. Store new hashed refresh token
      await this.usersService.updateRefreshToken(
        user.id,
        await bcrypt.hash(newRefreshToken, 10),
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Add to AuthService
  private revokedTokens = new Map<string, number>(); // token -> expiry timestamp

  // Add this method
  private isTokenRevoked(token: string): boolean {
    const expiry = this.revokedTokens.get(token);
    if (!expiry) return false;

    if (Date.now() > expiry) {
      this.revokedTokens.delete(token);
      return false;
    }
    return true;
  }

  async logout(userId: string) {
    const user = await this.usersService.findById(userId);
    if (user?.refreshToken) {
      // Add to blacklist for 5 minutes
      this.revokedTokens.set(user.refreshToken, Date.now() + 5 * 60 * 1000);
    }
    await this.usersService.updateRefreshToken(userId, '');
    return { message: 'Logged out successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return; // Don't reveal if user exists

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const token = this.jwtService.sign(
      { userId: user.id },
      { secret: this.configService.get('JWT_VERIFY_SECRET'), expiresIn: '1d' },
    );

    await this.usersService.updateEmailVerificationToken(user.id, token);
    await this.mailService.sendVerificationEmail(
      user.email,
      user.fullName,
      `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`,
    );

    return { message: 'Verification email resent if account exists' };
  }
}
