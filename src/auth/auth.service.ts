import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Register new user
  async register(name: string, email: string, password: string, role = 'USER') {
    try {
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.usersService.createUser({
        name,
        email,
        password: hashedPassword,
        role,
      });

      return { message: 'User registered successfully', user };
    } catch (error) {
      console.error('Error registering user:', error);

      // Handle known Nest exceptions
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle Mongoose duplicate key error
      if (error.code === 11000) {
        throw new ConflictException('Email already exists in DB');
      }

      // Handle validation errors from Mongoose
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors)
          .map((err: any) => err.message)
          .join(', ');
        throw new InternalServerErrorException(messages);
      }

      // Unknown errors
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  // Login user
  async login(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new UnauthorizedException('Invalid credentials');

      const payload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const token = this.jwtService.sign(payload);

      return { access_token: token };
    } catch (error) {
      console.error('Error logging in user:', error);

      if (
        error instanceof HttpException &&
        (error.getStatus() === HttpStatus.CONFLICT ||
          error.getStatus() === HttpStatus.UNAUTHORIZED)
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to login user');
    }
  }
}
