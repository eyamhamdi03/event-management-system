import { Controller, Get, Post , Body, Delete, Param, Patch, Put,Query} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Public } from '../auth/decorators/public.decorator'; 
import { DeleteUserDto } from './dto/delete-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Delete()
  @Public()
  remove(@Body() deleteUserDto: DeleteUserDto): Promise<{ message: string }> {
    return this.userService.remove(deleteUserDto.userId);
  }

  @Post(':id/restore')
  @Public()
  restore(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.restore(id);
  }

  @Post()
  @Public()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @Public()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('search')
  @Public()
  search(@Query('email') email?: string, @Query('fullName') fullName?: string): Promise<User[]> {
    return this.userService.searchUsers(email, fullName);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @Public()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }


}

