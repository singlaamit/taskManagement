import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // ------------------------
  // Create tests
  // ------------------------
  describe('create', () => {
    const validBody: CreateTaskDto = {
      title: 'Test task',
      description: 'Do something important',
    };
    const req = { user: { _id: 'user-id-123' } };

    it('should call tasksService.create and return created task', async () => {
      const createdTask = { _id: 'task-1', ...validBody, userId: req.user._id };
      mockTasksService.create.mockResolvedValue(createdTask);

      const res = await controller.create(validBody, req as any);

      expect(mockTasksService.create).toHaveBeenCalledWith(
        validBody.title,
        validBody.description,
        req.user._id,
      );
      expect(res).toEqual(createdTask);
    });

    it('should throw service error if create fails', async () => {
      mockTasksService.create.mockRejectedValue(new Error('create error'));

      await expect(controller.create(validBody, req as any)).rejects.toThrow(
        'create error',
      );
    });

    // ------------------------
    // Validation tests
    // ------------------------
    it('should throw BadRequestException if title is empty', async () => {
      const invalidBody = { ...validBody, title: '' };
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        pipe.transform(invalidBody, { type: 'body', metatype: CreateTaskDto }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if description is empty', async () => {
      const invalidBody = { ...validBody, description: '' };
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        pipe.transform(invalidBody, { type: 'body', metatype: CreateTaskDto }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ------------------------
  // findAll tests
  // ------------------------
  describe('findAll', () => {
    it('should call tasksService.findAll with req.user and return tasks', async () => {
      const req = { user: { _id: 'user-1', role: 'USER' } };
      const tasks = [{ _id: 't1', title: 't1' }];
      mockTasksService.findAll.mockResolvedValue(tasks);

      const res = await controller.findAll(req as any);

      expect(mockTasksService.findAll).toHaveBeenCalledWith(req.user);
      expect(res).toEqual(tasks);
    });
  });

  // ------------------------
  // Update tests
  // ------------------------
  describe('update', () => {
    const req = { user: { _id: 'user-1', role: 'USER' } };
    const validBody: UpdateTaskDto = {
      title: 'Updated Task',
      description: 'Updated description',
    };
    const taskId = 'task-1';

    it('should call tasksService.update and return updated task', async () => {
      const updatedTask = { _id: taskId, ...validBody };
      mockTasksService.update.mockResolvedValue(updatedTask);

      const res = await controller.update(taskId, validBody, req as any);

      expect(mockTasksService.update).toHaveBeenCalledWith(
        taskId,
        validBody,
        req.user,
      );
      expect(res).toEqual(updatedTask);
    });

    it('should propagate service error on update', async () => {
      mockTasksService.update.mockRejectedValue(new Error('update error'));

      await expect(
        controller.update(taskId, validBody, req as any),
      ).rejects.toThrow('update error');
    });

    // ------------------------
    // Validation tests
    // ------------------------
    it('should throw BadRequestException if title is empty', async () => {
      const invalidBody = { title: '' };
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        pipe.transform(invalidBody, { type: 'body', metatype: UpdateTaskDto }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ------------------------
  // Delete tests
  // ------------------------
  describe('delete', () => {
    const req = { user: { _id: 'user-1', role: 'USER' } };
    const taskId = 'task-1';

    it('should call tasksService.delete and return success message', async () => {
      const response = { message: 'Task deleted successfully' };
      mockTasksService.delete.mockResolvedValue(response);

      const res = await controller.delete(taskId, req as any);

      expect(mockTasksService.delete).toHaveBeenCalledWith(taskId, req.user);
      expect(res).toEqual(response);
    });

    it('should propagate service error on delete', async () => {
      mockTasksService.delete.mockRejectedValue(new Error('delete error'));

      await expect(controller.delete(taskId, req as any)).rejects.toThrow(
        'delete error',
      );
    });
  });

  // ------------------------
  // Analytics tests
  // ------------------------
  describe('getAnalytics', () => {
    it('should call tasksService.getAnalytics and return analytics', async () => {
      const analytics = {
        statusCounts: [{ _id: 'TODO', count: 2 }],
        avgCompletionTimeHours: '5.00',
        perUserCounts: [{ _id: 'user-1', count: 3 }],
      };
      mockTasksService.getAnalytics.mockResolvedValue(analytics);

      const res = await controller.getAnalytics();

      expect(mockTasksService.getAnalytics).toHaveBeenCalledTimes(1);
      expect(res).toEqual(analytics);
    });

    it('should propagate error from getAnalytics', async () => {
      mockTasksService.getAnalytics.mockRejectedValue(new Error('agg fail'));

      await expect(controller.getAnalytics()).rejects.toThrow('agg fail');
    });
  });
});
