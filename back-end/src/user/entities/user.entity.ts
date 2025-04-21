import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Registration } from '../../registration/entities/registration.entity';
import { TimestampEntities } from 'src/generics/timestamp.entities';
import { Event } from '../../event/entities/event.entity';
import { Role } from 'src/auth/roles.enum';
import { SocialProvider } from 'src/auth/socialProviders.enum';
@Entity()
export class User extends TimestampEntities {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column(
    {nullable: true}
  )
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column(
    {nullable: true}
  )
  password: string;

  @Column(
    {nullable: true}
  )
  phone: number;

  @Column(
    {nullable: true}
  )
  birthDate: Date;

  @Column({ nullable: true })
  salt: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User
  })
  role: Role;

  @OneToMany(() => Registration, (registration) => registration.user)
  registrations: Registration[];

  @Column({ 
    name: 'password_reset_token',
    type: 'varchar', 
    length: 255,     
    nullable: true   
  })
  passwordResetToken: string | null;


  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;


  @OneToMany(() => Event, (event) => event.host)
  hostedEvents: Event[];

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  socialId: string; // The ID from the social provider

  @Column({ nullable: true })
  avatar: string; // The URL of the user's avatar

  @Column({ 
    type: 'enum',
    enum: SocialProvider,
    default: SocialProvider.Local
    })
    provider: string;


}
