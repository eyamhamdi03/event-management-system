import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Event } from '../../event/entities/event.entity';
import { MessageReaction } from './message-reaction.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Event, { onDelete: 'CASCADE' })
    event: Event;

    @Column({ type: 'uuid' })
    eventId: string;

    @OneToMany(() => MessageReaction, (reaction) => reaction.message, { cascade: true })
    reactions: MessageReaction[];

    @Column({ default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}