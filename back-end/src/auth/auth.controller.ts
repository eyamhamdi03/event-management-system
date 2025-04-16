import { Controller, Post, Body, Get,Req,Query ,UseGuards, Res } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,    
    private configService: ConfigService 
  ) {}

  @Post('register')
  @Public() 
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('admin')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  testAuth() {
    return "access is granted: admin"
  }

  @Get('auth')
  @UseGuards(JwtAuthGuard)
  test() {
    return "access is granted"
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
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
  return this.authService.logout(user.sub);}

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
  async googleAuthRedirect(@Req() req: Request, @Res() res: any) {
    if (!req.user) {
      return res.redirect(`${this.configService.get('FRONTEND_URL')}/login?error=social_auth_failed`);
    }

  const SocialUserDto = req.user as {
    email: string;
    firstName: string;
    lastName: string;
    provider: string;
    accessToken: string;
  };

  try {
    const result = await this.authService.validateSocialUser({
      email: SocialUserDto.email,
      firstName: SocialUserDto.firstName,
      lastName: SocialUserDto.lastName,
      provider: "google",
    });

    return res.redirect(
      `${this.configService.get('FRONTEND_URL')}/auth/callback?token=${result.access_token}`
    );
  } catch (error) {
    return res.redirect(
      `${this.configService.get('FRONTEND_URL')}/login?error=auth_failed`
    );
  }
}



}

