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
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center;">
            <h2 style="color: #ff6f00;">Password Reset Request</h2>
          </div>
          <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px;">
            We received a request to reset your password. Click the button below to proceed:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ff6f00; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #888888;">
            If you didn’t request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;" />
          <p style="font-size: 12px; color: #999999; text-align: center;">
            This link will expire in 1 hour.
          </p>
        </div>
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
  
  async sendRegistrationConfirmation(email: string, fullName: string, eventName: string, eventDate: string) {
    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: `Registration Confirmed for ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center;">
            <h2 style="color: #2196F3;">Registration Confirmed!</h2>
          </div>
          <p style="font-size: 16px;">Hi <strong>${fullName}</strong>,</p>
          <p style="font-size: 16px;">
            You have successfully registered for <strong>${eventName}</strong>.<br/>
            <b>Date:</b> ${eventDate}
          </p>
          <p style="font-size: 14px; color: #888888;">We look forward to seeing you at the event!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;" />
          <p style="font-size: 12px; color: #999999; text-align: center;">
            If you have any questions, reply to this email.
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}