import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { InternalServerErrorException } from '@nestjs/common';

// TEMP debug log (remove if you want)
// console.log('users.controller.spec.ts loaded');

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

  //  Test: Get own profile
  describe('getMyProfile', () => {
    it('should return the logged-in user profile', async () => {
      const mockReq = { user: { _id: '123' } };
      const result = { _id: '123', name: 'Amit' };
      mockUsersService.findById.mockResolvedValue(result);

      await expect(controller.getMyProfile(mockReq)).resolves.toEqual(result);
      expect(mockUsersService.findById).toHaveBeenCalledWith('123');
    });
  });

  //  Test: Get user by ID (ADMIN)
  describe('getUserById', () => {
    it('should return user details by ID', async () => {
      const result = { _id: '123', name: 'Amit' };
      mockUsersService.findById.mockResolvedValue(result);

      await expect(controller.getUserById('123')).resolves.toEqual(result);
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

      await expect(controller.updateMyProfile(mockReq, body)).resolves.toEqual(
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

      await expect(controller.deleteUser('123')).resolves.toEqual(result);
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith('123');
    });
  });
});
