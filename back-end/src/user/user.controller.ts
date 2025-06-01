import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { DeleteUserDto } from './dto/delete-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('user')
@UseGuards(JwtAuthGuard) // Protect all routes by default
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  @Roles(Role.Admin, Role.User, Role.Organizer)
  @Throttle({ default: { limit: 60, ttl: 60 } })
  getMe(@Req() req: any) {
    return req.user;
  }
  @Delete()
  @Roles(Role.Admin) // Only admins can delete users
  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests/min
  async remove(
    @Body() deleteUserDto: DeleteUserDto,
  ): Promise<{ message: string }> {
    return this.userService.remove(deleteUserDto.userId);
  }

  @Post(':id/restore')
  @Roles(Role.Admin) // Only admins can restore users
  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests/min
  async restore(@Param('id') id: string): Promise<{ message: string }> {
    return this.userService.restore(id);
  }

  @Post()
  @Roles(Role.Admin) // Only admins can create
  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 requests/min
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @Roles(Role.Admin) // Only admins can list all users
  @Throttle({ default: { limit: 30, ttl: 60 } }) // 30 requests/min
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('search')
  @Roles(Role.Admin)
  @Throttle({ default: { limit: 20, ttl: 60 } }) // 20 requests/min
  async search(
    @Query('email') email?: string,
    @Query('fullName') fullName?: string,
  ): Promise<User[]> {
    return this.userService.searchUsers(email, fullName);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.User)
  @Throttle({ default: { limit: 60, ttl: 60 } })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.userService.getUserProfile(id, req.user);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.User)
  @Throttle({ default: { limit: 10, ttl: 60 } })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.userService.updateUserProfile(id, updateUserDto, req.user);
  }
}
