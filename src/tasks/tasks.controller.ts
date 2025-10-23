import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Create Task
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req: any) {
    const { title, description } = createTaskDto;
    return this.tasksService.create(title, description, req.user._id);
  }

  // Get Tasks
  @Get()
  async findAll(@Req() req: any) {
    return this.tasksService.findAll(req.user);
  }

  // Update Task (only ADMIN can update any)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user);
  }

  // Delete Task
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.delete(id, req.user);
  }

  // Analytics (Admin Only)
  @Get('analytics/tasks')
  @Roles('ADMIN')
  async getAnalytics() {
    return this.tasksService.getAnalytics();
  }
}
