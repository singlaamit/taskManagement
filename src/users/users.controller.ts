import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  Put,
  Body,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // New route for all users
  @Get('getAllUsers')
  @Roles('ADMIN')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  // Any logged-in user can view their profile
  @Get('me')
  async getMyProfile(@Req() req) {
    return this.usersService.findById(req.user._id);
  }

  // Get user by ID (ADMIN only)
  @Get(':id')
  @Roles('ADMIN')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // Update profile for logged-in user
  @Put('me')
  async updateMyProfile(@Req() req, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(req.user._id, body);
  }

  // Delete user (ADMIN only)
  @Delete(':id')
  @Roles('ADMIN')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
