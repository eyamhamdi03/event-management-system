import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Message } from './message.entity';

@Entity()
@Unique(['user', 'message'])
export class MessageReaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    emoji: string;

    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Message, (message) => message.reactions, { onDelete: 'CASCADE' })
    message: Message;

    @CreateDateColumn()
    createdAt: Date;
}