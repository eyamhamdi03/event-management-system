import { All, Controller, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { GraphQLService } from './graphql.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('graphql')
@Public()
export class GraphQLController {
  constructor(private readonly graphqlService: GraphQLService) {}

  @All()
  async graphql(@Req() req: Request, @Res() res: Response) {
    return this.graphqlService.getHandler()(req, res);
  }
}
