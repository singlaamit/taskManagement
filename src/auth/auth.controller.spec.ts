import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // ------------------------
  // Register tests
  // ------------------------
  describe('register', () => {
    const validBody: CreateUserDto = {
      name: 'Amit Singla',
      email: 'amit@gmail.com',
      password: '123456',
      role: 'USER',
    };

    it('should call AuthService.register and return result', async () => {
      const result = { id: '1', ...validBody };
      mockAuthService.register.mockResolvedValue(result);

      const response = await controller.register(validBody);

      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        validBody.name,
        validBody.email,
        validBody.password,
        validBody.role,
      );
      expect(response).toEqual(result);
    });

    it('should throw error if AuthService.register fails', async () => {
      mockAuthService.register.mockRejectedValue(
        new Error('Registration failed'),
      );

      await expect(controller.register(validBody)).rejects.toThrow(
        'Registration failed',
      );
    });

    // ------------------------
    // Validation tests (BadRequestException)
    // ------------------------
    it('should throw BadRequestException if name is empty', async () => {
      const invalidBody = { ...validBody, name: '' };
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        pipe.transform(invalidBody, { type: 'body', metatype: CreateUserDto }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email is invalid', async () => {
      const invalidBody = { ...validBody, email: 'invalidemail' };
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        pipe.transform(invalidBody, { type: 'body', metatype: CreateUserDto }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password too short', async () => {
      const invalidBody = { ...validBody, password: '123' };
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        pipe.transform(invalidBody, { type: 'body', metatype: CreateUserDto }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if role is empty', async () => {
      const invalidBody = { ...validBody, role: '' };
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        pipe.transform(invalidBody, { type: 'body', metatype: CreateUserDto }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ------------------------
  // Login tests
  // ------------------------
  describe('login', () => {
    const validLogin: LoginUserDto = {
      email: 'amit@gmail.com',
      password: '123456',
    };

    it('should call AuthService.login and return token', async () => {
      const tokenResponse = { access_token: 'jwt-token-123' };
      mockAuthService.login.mockResolvedValue(tokenResponse);

      const result = await controller.login(validLogin);

      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        validLogin.email,
        validLogin.password,
      );
      expect(result).toEqual(tokenResponse);
    });

    it('should throw error if AuthService.login fails', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(validLogin)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    // Validation tests
    it('should throw BadRequestException if email is empty', async () => {
      const invalidLogin = { ...validLogin, email: '' };
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        pipe.transform(invalidLogin, { type: 'body', metatype: LoginUserDto }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is empty', async () => {
      const invalidLogin = { ...validLogin, password: '' };
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        pipe.transform(invalidLogin, { type: 'body', metatype: LoginUserDto }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email format is invalid', async () => {
      const invalidLogin = { ...validLogin, email: 'invalidemail' };
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        pipe.transform(invalidLogin, { type: 'body', metatype: LoginUserDto }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
