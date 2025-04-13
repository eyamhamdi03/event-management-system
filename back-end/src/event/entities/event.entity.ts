import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Registration } from '../../registration/entities/registration.entity';
import { TimestampEntities } from 'src/generics/timestamp.entities';

@Entity()
export class Event extends TimestampEntities {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  eventDate: Date;

  @Column()
  location: string;
  @OneToMany(() => Registration, (registration) => registration.event)
  registrations: Registration[];
}
