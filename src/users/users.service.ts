import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // Create new user
  async createUser({
    name,
    email,
    password,
    role = 'USER',
  }: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<User> {
    try {
      const newUser = new this.userModel({ name, email, password, role });
      return await newUser.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // Get all users (excluding passwords)
  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().select('-password');
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  // Find user by ID
  async findById(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).select('-password');
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  // Find user by Email
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new InternalServerErrorException('Failed to fetch user by email');
    }
  }

  // Update user details
  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.userModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  // Delete user by ID
  async deleteUser(id: string): Promise<void> {
    try {
      const result = await this.userModel.findByIdAndDelete(id);
      if (!result) throw new NotFoundException('User not found');
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
