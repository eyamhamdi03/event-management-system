import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Registration } from '../../registration/entities/registration.entity';
import { TimestampEntities } from 'src/generics/timestamp.entities';
import { Event } from '../../event/entities/event.entity';

@Entity()
export class User extends TimestampEntities {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phone: number;

  @Column()
  birthDate: Date;

  @Column({ nullable: true })
  salt: string;

  @Column({ default: 'user' })
  role: string;

  @OneToMany(() => Registration, (registration) => registration.user)
  registrations: Registration[];

  @OneToMany(() => Event, (event) => event.host)
  hostedEvents: Event[];
}
