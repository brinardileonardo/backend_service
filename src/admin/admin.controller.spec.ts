import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Request, Response } from 'express';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

describe('AdminController', () => {
    let controller: AdminController;
    let adminService: AdminService;

    const mockRequest = {} as Request;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        controllers: [AdminController],
        providers: [
            {
                provide: AdminService,
                useValue: {
                    getAllUser: jest.fn(),
                },
            },
        ],
        }).compile();

        controller = module.get<AdminController>(AdminController);
        adminService = module.get<AdminService>(AdminService);
    });

    describe('getAllUser', () => {
        it('should return a success response with user data', async () => {
            const mockUsers = [
                { id: 1, username: 'user1', createdAt: new Date(), wallet: { balance: 100 } },
                { id: 2, username: 'user2', createdAt: new Date(), wallet: { balance: 200 } },
            ];

            jest.spyOn(adminService, 'getAllUser').mockResolvedValue(mockUsers);

            await controller.getAllUser(mockRequest, mockResponse);

            expect(adminService.getAllUser).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'Success',
                message: mockUsers,
            });
        });

        it('should handle known exceptions and return the appropriate response', async () => {
            const errorResponse = new NotFoundException('No users found');

            jest.spyOn(adminService, 'getAllUser').mockRejectedValue(errorResponse);

            await controller.getAllUser(mockRequest, mockResponse);

            expect(adminService.getAllUser).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(errorResponse.getStatus());
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'Error !',
                message: 'No users found',
            });
        });

        it('should handle unknown errors and return a 500 response', async () => {
            jest.spyOn(adminService, 'getAllUser').mockRejectedValue(new Error('Unexpected error'));

            await controller.getAllUser(mockRequest, mockResponse);

            expect(adminService.getAllUser).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'Error!',
                message: 'Internal Server Error!',
            });
        });
    });
});
