import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { User } from './user.model';
import { UserService } from './user.service';

const mockUser: User = { id: 1, username: 'Budi', createdAt: new Date(), role: 'user' };

describe('UsersService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn().mockResolvedValue([mockUser]),
              findUnique: jest.fn().mockResolvedValue(mockUser),
              create: jest.fn().mockResolvedValue(mockUser),
              delete: jest.fn().mockResolvedValue(mockUser),
              update: jest.fn().mockResolvedValue(mockUser),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const newUser = { username : 'Lisa', createdAt : new Date(), role: 'user'} as User;
    jest.spyOn(prisma.user, 'create').mockResolvedValue({ id: 3, ...newUser });
    
    expect(await service.createUser(newUser)).toEqual({ id: 3, ...newUser });
    expect(prisma.user.create).toHaveBeenCalledWith({ data: newUser });
  });
});