import { Controller, Post, Body, Get, Req, Query, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { Public } from '../auth/decorators/public.decorator';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { MailService } from '../mail/mail.service';

@Controller('auth')
@SkipThrottle() // Skip rate limiting by default for all endpoints
export class AuthController {
    constructor(
      private authService: AuthService,
      private configService: ConfigService,
      private mailService: MailService
    ) { }

  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests per minute
  @Post('register')
  @Public()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 requests per minute
  @Post('login')
  @Public()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Throttle({ default: { limit: 3, ttl: 3600 } }) // 3 requests per hour
  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 requests per minute
  @Post('reset-password')
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.authService.logout(user.sub);
  }

  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests per minute
  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const { redirectUrl } = await this.authService.handleGoogleAuthCallback(req as any);
      return res.redirect(redirectUrl);
    } catch (error) {
      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}/login?error=auth_failed`
      );
    }
  }

  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests per minute
  @Post('resend-verification')
  @Public()
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } }) // 10 requests per minute
  @Post('refresh-token')
  @Public()
  async refreshToken(
    @Body() body: { refreshToken: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.authService.refreshTokens(body.refreshToken);

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { access_token: tokens.access_token };
  }
  @Get('admin')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  testAuth() {
    return "access is granted: admin";
  }

  @Get('email-status')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  getEmailStatus() {
    return {
      configured: this.mailService.isEmailConfigured(),
      status: this.mailService.getEmailStatus()
    };
  }

  @Get('auth') @UseGuards(JwtAuthGuard)
  test() {
    return "access is granted";
  }
}