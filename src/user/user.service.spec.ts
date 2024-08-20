import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserService } from './user.service';
import { user } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createUser', () => {
    it('should throw a ConflictException if username already exists', async () => {
      const userData: user = {
        id: 1,
        username: 'TestUser',
        password: 'testpassword',
        role: 'user',
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(userData);

      await expect(service.createUser(userData)).rejects.toThrow(ConflictException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: userData.username.toLowerCase() },
      });
    });

    it('should create a new user if username does not exist', async () => {
      const userData: user = {
        id: 1,
        username: 'TestUser',
        password: 'testpassword',
        role: 'user',
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(userData);

      const result = await service.createUser(userData);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: userData.username.toLowerCase() },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...userData,
          username: userData.username.toLowerCase(),
          password: userData.password,
          role: 'user',
          wallet: {
            create: {
              balance: 0,
            },
          },
          mutation: {
            create: [
              {
                createdBy: 'system',
                description: 'first initial balance',
                type: 'credits',
                amount: 0,
              },
            ],
          },
        },
      });
      expect(result).toEqual(userData);
    });
  });
});