import {
  Controller,
  Sse,
  MessageEvent,
  Req,
  UseGuards,
  OnModuleDestroy,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';
import NotificationsService from './notifications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { NotificationDto } from './dto/notification.dto';

@Controller('sse')
export default class NotificationController implements OnModuleDestroy {
  constructor(private readonly notifications: NotificationsService) {}
  @UseGuards(JwtAuthGuard)
  @Sse('notifications')
  stream(@Req() req: Request): Observable<MessageEvent> {
    const { userId } = req.user as { userId: string };
    console.log('SSE connection opened for userId:', userId);

    return this.notifications.connect(userId).pipe(
      map((notif) => {
        console.log('Sending notification to user', userId, notif);
        return { data: notif };
      }),
    );
  }
  onModuleDestroy() {}

  @Post('send/:userId')
  sendToUser(
    @Param('userId') userId: string,
    @Body() payload: NotificationDto,
  ) {
    this.notifications.sendToUser(userId, payload);
    return { status: 'sent' };
  }
}
