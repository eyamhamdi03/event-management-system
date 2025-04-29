import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    try {
      console.log('=== Google Strategy Validate ===');
      console.log('Profile received:', JSON.stringify(profile, null, 2));
      console.log('Access Token:', accessToken);
      
      const { name, emails, photos } = profile;
      
      if (!emails || !emails[0] || !emails[0].value) {
        console.error('No email found in Google profile');
        return done(new Error('No email found in Google profile'), false);
      }

      const user = {
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos[0].value,
        accessToken,
        provider: 'google',
      };

      console.log('Processed user data:', JSON.stringify(user, null, 2));
      done(null, user);
    } catch (error) {
      console.error('Error in Google strategy validate:', error);
      done(error, false);
    }
  }
}