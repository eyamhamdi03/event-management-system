import { Controller, Get, Post , Body} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Public } from '../auth/decorators/public.decorator'; 
import { DeleteUserDto } from './dto/delete-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getUsers();
  }

  @Post('delete')
  @Public() 
  async deleteUser(@Body() deleteUserDto: DeleteUserDto) {
    return this.userService.deleteUser(deleteUserDto.userId);

  }
}