import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  // Create Task — linked to logged-in user
  async create(
    title: string,
    description: string,
    userId: string,
  ): Promise<Task> {
    try {
      const existing = await this.taskModel.findOne({ title });

      if (existing) {
        throw new ConflictException('Task title must be unique');
      }

      const newTask = new this.taskModel({
        title,
        description,
        userId: new Types.ObjectId(userId),
      });
      return await newTask.save();
    } catch (error) {
      console.error('Error creating task:', error);
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  // Get Tasks (ADMIN → all, USER → own only)
  async findAll(user: any): Promise<Task[]> {
    try {
      if (user.role === 'ADMIN') {
        return await this.taskModel.find().populate('userId', 'name email');
      }
      return await this.taskModel.find({ userId: user._id });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new InternalServerErrorException('Failed to fetch tasks');
    }
  }

  // Find task by ID
  async findById(id: string): Promise<Task> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');
      return task;
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch task');
    }
  }

  // Update Task (only owner or ADMIN)
  async update(
    id: string,
    updateData: Partial<Task>,
    user: any,
  ): Promise<Task> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');

      if (
        user.role !== 'ADMIN' &&
        task.userId.toString() !== user._id.toString()
      ) {
        throw new ForbiddenException('You are not allowed to update this task');
      }

      Object.assign(task, updateData);
      if (updateData.status === 'DONE') {
        task.completedAt = new Date();
      }

      return await task.save();
    } catch (error) {
      console.error('Error updating task:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new InternalServerErrorException('Failed to update task');
    }
  }

  // Delete Task (only owner or ADMIN)
  async delete(id: string, user: any): Promise<{ message: string }> {
    try {
      const task = await this.taskModel.findById(id);
      if (!task) throw new NotFoundException('Task not found');

      if (
        user.role !== 'ADMIN' &&
        task.userId.toString() !== user._id.toString()
      ) {
        throw new ForbiddenException('You are not allowed to delete this task');
      }

      await this.taskModel.findByIdAndDelete(id);

      //  Return explicit success message
      return { message: 'Task deleted successfully' };
    } catch (error) {
      console.error('Error deleting task:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete task');
    }
  }

  // Analytics (ADMIN only)
  async getAnalytics() {
    try {
      const tasks = await this.taskModel.find();

      // Count per status
      const statusCounts = await this.taskModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      // Average completion time (createdAt → completedAt)
      const completedTasks = tasks.filter((t) => t.completedAt && t.createdAt);

      const avgCompletionTime =
        completedTasks.length > 0
          ? completedTasks.reduce((sum, t) => {
              const completedAt = t.completedAt ? t.completedAt.getTime() : 0;
              const createdAt = t.createdAt ? t.createdAt.getTime() : 0;
              return sum + (completedAt - createdAt);
            }, 0) /
            completedTasks.length /
            (1000 * 60 * 60)
          : 0;

      // Task counts per user
      const perUserCounts = await this.taskModel.aggregate([
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]);

      return {
        statusCounts,
        avgCompletionTimeHours: avgCompletionTime.toFixed(2),
        perUserCounts,
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new InternalServerErrorException('Failed to fetch analytics');
    }
  }
}
