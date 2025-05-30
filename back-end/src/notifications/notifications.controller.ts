import {
  Controller,
  Sse,
  MessageEvent,
  Req,
  UseGuards,
  OnModuleDestroy,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';
import NotificationsService from './notifications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('sse')
export default class NotificationController implements OnModuleDestroy {
  constructor(private readonly notifications: NotificationsService) {}
  @UseGuards(JwtAuthGuard)
  @Sse('notifications')
  stream(@Req() req: Request): Observable<MessageEvent> {
    const { userId } = req.user as { userId: string };
    return this.notifications
      .connect(userId)
      .pipe(map((notif) => ({ data: notif })));
  }
  onModuleDestroy() {}
}
