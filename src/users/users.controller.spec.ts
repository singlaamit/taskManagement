import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  //  Test: Get all users (ADMIN)
  describe('getAllUsers', () => {
    it('should return all users (ADMIN only)', async () => {
      const result = [{ name: 'Amit' }, { name: 'Amit' }];
      mockUsersService.findAll.mockResolvedValue(result);

      expect(await controller.getAllUsers()).toEqual(result);
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  //  Test: Get own profile
  describe('getMyProfile', () => {
    it('should return the logged-in user profile', async () => {
      const mockReq = { user: { _id: '123' } };
      const result = { _id: '123', name: 'Amit' };
      mockUsersService.findById.mockResolvedValue(result);

      expect(await controller.getMyProfile(mockReq)).toEqual(result);
      expect(mockUsersService.findById).toHaveBeenCalledWith('123');
    });
  });

  //  Test: Get user by ID (ADMIN)
  describe('getUserById', () => {
    it('should return user details by ID', async () => {
      const result = { _id: '123', name: 'Amit' };
      mockUsersService.findById.mockResolvedValue(result);

      expect(await controller.getUserById('123')).toEqual(result);
      expect(mockUsersService.findById).toHaveBeenCalledWith('123');
    });
  });

  //  Test: Update own profile
  describe('updateMyProfile', () => {
    it('should update logged-in user profile', async () => {
      const mockReq = { user: { _id: '123' } };
      const body = { name: 'Updated Name' };
      const updatedUser = { _id: '123', name: 'Updated Name' };

      mockUsersService.updateUser.mockResolvedValue(updatedUser);

      expect(await controller.updateMyProfile(mockReq, body)).toEqual(
        updatedUser,
      );
      expect(mockUsersService.updateUser).toHaveBeenCalledWith('123', body);
    });
  });

  //  Test: Delete user (ADMIN)
  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      const result = { message: 'User deleted successfully' };
      mockUsersService.deleteUser.mockResolvedValue(result);

      expect(await controller.deleteUser('123')).toEqual(result);
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith('123');
    });
  });
});
