import { User } from './user/entities/user.entity';
import { Event } from './event/entities/event.entity';
import { Registration } from './registration/entities/registration.entity';
import { Category } from './category/entities/category.entity';
import { Message } from './chat/entities/message.entity';
import { MessageReaction } from './chat/entities/message-reaction.entity';

export const typeOrmConfig = {
  type: 'mysql' as const,
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Event, Registration, Category, Message, MessageReaction],
  synchronize: true,
};