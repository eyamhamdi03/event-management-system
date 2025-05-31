import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateEventInput {
  @Field()
  title: string;
  
  @Field()
  description: string;
  
  @Field()
  startDate: Date;
  
  @Field()
  endDate: Date;
  
  @Field()
  location: string;
  
  @Field()
  organizerId: string;
  
  @Field(() => [String])
  categoryIds: string[];
  
  @Field(() => Number, { nullable: true })
  maxParticipants?: number;
}