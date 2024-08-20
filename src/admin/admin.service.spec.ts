import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

describe('AdminService', () => {
    let service: AdminService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminService,
                {
                    provide: PrismaService,
                    useValue: {
                        admin: {
                            findFirst: jest.fn(),
                            create: jest.fn(),
                        },
                        user: {
                            findMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<AdminService>(AdminService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe('validatePassword', () => {
        it('should throw an error if password is invalid', async () => {
            const invalidPassword = 'weakpass';

            await expect(service.validatePassword(invalidPassword)).rejects.toThrow(BadRequestException);
            await expect(service.validatePassword(invalidPassword)).rejects.toThrow(
                'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            );
        });

        it('should not throw an error if password is valid', async () => {
            const validPassword = 'StrongPass1!';

            await expect(service.validatePassword(validPassword)).resolves.not.toThrow();
        });
    });

    describe('createAdmin', () => {
        it('should throw a ConflictException if admin already exists', async () => {
            const adminData = { name: 'admin', email: 'admin@example.com', password: 'StrongPass1!' } as any;

            jest.spyOn(prismaService.admin, 'findFirst').mockResolvedValue(adminData);

            await expect(service.createAdmin(adminData)).rejects.toThrow(ConflictException);
            await expect(service.createAdmin(adminData)).rejects.toThrow('username already exists');
        });
    });
});
