import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Unique } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Event } from '../../event/entities/event.entity';
import { TimestampEntities } from '../../generics/timestamp.entities';

@Entity()
@Unique(['user', 'event'])
export class Ticket extends TimestampEntities { 
    
    @PrimaryGeneratedColumn('uuid')  
    id: string;  
    
    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })  
    user: User; 
    
    @ManyToOne(() => Event, { eager: true, onDelete: 'CASCADE' })  
    event: Event;  
    
    @Column({ default: false })  
    checkedIn: boolean;}