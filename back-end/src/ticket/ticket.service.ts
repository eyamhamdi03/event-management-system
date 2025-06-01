import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Event } from '../event/entities/event.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    private readonly dataSource: DataSource, 
  ) {}

  async issueTicket(user: User, event: Event): Promise<Ticket> {
    return await this.dataSource.transaction(async manager => {
      // Lock the event row for update
      const lockedEvent = await manager.findOne(Event, {
        where: { id: event.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!lockedEvent) throw new NotFoundException('Event not found');

      // Check if user already has a ticket
      const existing = await manager.findOne(Ticket, { where: { user: { id: user.id }, event: { id: event.id } } });
      if (existing) throw new ConflictException('User already has a ticket for this event');

      // Count current tickets
      const count = await manager.count(Ticket, { where: { event: { id: event.id } } });
      if (lockedEvent.participantLimit && count >= lockedEvent.participantLimit) {
        throw new ConflictException('No tickets left');
      }

      const ticket = manager.create(Ticket, { user, event: lockedEvent });
      return await manager.save(ticket);
    });
  }

  async getTicketById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({ where: { id }, relations: ['user', 'event'] });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async findTicketByUserAndEvent(userId: string, eventId: string): Promise<Ticket | undefined> {
    const ticket = await this.ticketRepo.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
      },
    });
    return ticket === null ? undefined : ticket;
  }

  async checkInTicket(ticket: Ticket): Promise<Ticket> {
    ticket.checkedIn = true;
    return this.ticketRepo.save(ticket);
  }

  async updateTicket(ticket: Ticket): Promise<Ticket> {
    return this.ticketRepo.save(ticket);
  }
}