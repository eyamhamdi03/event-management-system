import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field()
  username: string;
  
  @Field()
  email: string;
  
  @Field()
  password: string;
  
  @Field(() => UserRole, { nullable: true })
  role?: UserRole;
}