import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Event } from '../../event/entities/event.entity';
import { MessageReaction } from './message-reaction.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    content: string;

    @ManyToOne(() => User, { eager: true })
    user: User;

    @ManyToOne(() => Event, { onDelete: 'CASCADE' })
    event: Event;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ default: false })
    isDeleted: boolean;

    @OneToMany(() => MessageReaction, (reaction) => reaction.message, { cascade: true })
    reactions: MessageReaction[];
}