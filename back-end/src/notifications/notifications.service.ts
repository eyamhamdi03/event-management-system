import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { NotificationDto } from './dto/notification.dto';

@Injectable()
export default class NotificationService implements OnModuleDestroy {
  private readonly streams = new Map<string, Subject<NotificationDto>>();
  connect(userId: string): Observable<NotificationDto> {
    if (!this.streams.has(userId)) {
      this.streams.set(userId, new Subject<NotificationDto>());
    }
    return this.streams.get(userId)!.asObservable();
  }
  sendToUser(userId: string, payload: NotificationDto): void {
    const subject = this.streams.get(userId);
    if (subject) subject.next(payload);
  }
  onModuleDestroy() {
    for (const subject of this.streams.values()) {
      subject.complete();
    }
  }
}
