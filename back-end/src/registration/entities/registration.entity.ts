import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Event } from '../../event/entities/event.entity';
import { TimestampEntities } from '../../generics/timestamp.entities';

@Entity()
export class Registration extends TimestampEntities {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.registrations, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Event, (event) => event.registrations, {
    eager: true,
    onDelete: 'CASCADE',
  })
  event: Event;

  @Column({ default: false })
  confirmed: boolean;
}
