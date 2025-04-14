import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Registration } from '../../registration/entities/registration.entity';
import { TimestampEntities } from 'src/generics/timestamp.entities';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Event extends TimestampEntities {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  eventDate: Date;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @OneToMany(() => Registration, (registration) => registration.event)
  registrations: Registration[];

  @ManyToOne(() => User, (user) => user.hostedEvents, { eager: true })
  host: User;
}
