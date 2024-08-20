import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { WalletService } from './wallet.service';
import { UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('WalletService', () => {
    let service: WalletService;
    let prismaService: PrismaService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            WalletService,
            {
                provide: PrismaService,
                useValue: {
                    user: {
                        findUnique: jest.fn(),
                    },
                    wallet: {
                        update: jest.fn(),
                        findUnique: jest.fn(),
                    },
                    mutation: {
                        create: jest.fn(),
                        findMany: jest.fn(),
                        groupBy: jest.fn(),
                    },
                    $transaction: jest.fn(),
                },
            },
            {
                provide: JwtService,
                useValue: {
                    decode: jest.fn(),
                },
            },
        ],
        }).compile();

        service = module.get<WalletService>(WalletService);
        prismaService = module.get<PrismaService>(PrismaService);
        jwtService = module.get<JwtService>(JwtService);
    });

    describe('validateUserByToken', () => {
        it('should throw an UnauthorizedException if the token is invalid', async () => {
            jest.spyOn(jwtService, 'decode').mockReturnValue(null);
            await expect(service.validateUserByToken('invalid-token')).rejects.toThrow(UnauthorizedException);
        });

        it('should throw an UnauthorizedException if the user is not found', async () => {
            const decodedToken = { username: 'testuser' };
            jest.spyOn(jwtService, 'decode').mockReturnValue(decodedToken);
            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

            await expect(service.validateUserByToken('valid-token')).rejects.toThrow(UnauthorizedException);
        });

        it('should return the user if the token is valid', async () => {
            const decodedToken = { username: 'testuser' };
            const user = { id: 1, username: 'testuser', password: '12313123123a', role: 'user' ,createdAt: new Date() };
            jest.spyOn(jwtService, 'decode').mockReturnValue(decodedToken);
            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

            const result = await service.validateUserByToken('valid-token');
            expect(result).toEqual(user);
        });
    });

    describe('transfer', () => {
        it('should throw a BadRequestException if transferring to own account', async () => {
            const user = { id: 1, username: 'testuser', password: '12313123123a', role: 'user' ,createdAt: new Date() };
            jest.spyOn(service, 'validateUserByToken').mockResolvedValue(user);

            await expect(service.transfer('valid-token', 500, 'testuser')).rejects.toThrow(BadRequestException);
        });

        it('should throw a BadRequestException if the amount is invalid', async () => {
            const user = { id: 1, username: 'testuser', password: '12313123123a', role: 'user' ,createdAt: new Date() };
            jest.spyOn(service, 'validateUserByToken').mockResolvedValue(user);

            await expect(service.transfer('valid-token', 10000000, 'anotheruser')).rejects.toThrow(BadRequestException);
        });

        it('should throw a NotFoundException if the target user is not found', async () => {
            const user = { id: 1, username: 'testuser', password: '12313123123a', role: 'user' ,createdAt: new Date() };
            jest.spyOn(service, 'validateUserByToken').mockResolvedValue(user);
            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

            await expect(service.transfer('valid-token', 500, 'nonexistentuser')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getTransaction', () => {
        it('should return an empty list if no transactions are found', async () => {
            const user = { id: 1, username: 'testuser', password: '12313123123a', role: 'user' ,createdAt: new Date() };
            jest.spyOn(service, 'validateUserByToken').mockResolvedValue(user);
            jest.spyOn(prismaService.mutation, 'findMany').mockResolvedValue([]);

            const result = await service.getTransaction('valid-token');
            expect(result).toEqual({
                message: 'No transactions found for this user.',
                transactions: [],
            });
        });
    });
});