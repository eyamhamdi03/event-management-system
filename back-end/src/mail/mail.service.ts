import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello ${name},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(email: string, fullName: string, url: string) {
    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center;">
            <h2 style="color: #4CAF50;">Welcome to Our App, ${fullName}!</h2>
          </div>
          <p style="font-size: 16px;">Thanks for signing up! Please confirm your email address by clicking the button below.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #4CAF50; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">
              Verify Email
            </a>
          </div>
          <p style="font-size: 14px; color: #888888;">If you didn’t create this account, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;" />
          <p style="font-size: 12px; color: #999999; text-align: center;">This link will expire in 24 hours.</p>
        </div>
      `,
    };
  
    await this.transporter.sendMail(mailOptions);
  }
  
  
}