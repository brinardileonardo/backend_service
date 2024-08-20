import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/authentication/auth.guard';
import { TopUpDto } from './dto/topup.dto';
import { TransferDto } from './dto/transfer.dto';
import { UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('WalletController', () => {
    let controller: WalletController;
    let service: WalletService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WalletController],
            providers: [
                {
                    provide: WalletService,
                    useValue: {
                        topUp: jest.fn(),
                        getBalanceUser: jest.fn(),
                        transfer: jest.fn(),
                        getTransaction: jest.fn(),
                        getTransactionByDebitUser: jest.fn(),
                        getListTransactionUser: jest.fn(),
                    },
                },
            ],
        })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: jest.fn(() => true) })
        .compile();

        controller = module.get<WalletController>(WalletController);
        service = module.get<WalletService>(WalletService);
    });

    describe('topUp', () => {
        it('should top up the user\'s balance and return a success response', async () => {
            const topUpDto: TopUpDto = { amount: 1000 };
            const request = { headers: { authorization: 'Bearer valid-token' } } as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'topUp').mockResolvedValue({
                message: 'Topup successful',
                newBalance: 1000,
            });

            await controller.topUp(request, response, topUpDto);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Success',
                message: 'Topup successful',
                newBalance: 1000,
            });
        });

        it('should return an error response on failure', async () => {
            const topUpDto: TopUpDto = { amount: 1000 };
            const request = { headers: { authorization: 'Bearer invalid-token' } } as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'topUp').mockRejectedValue(new BadRequestException('Topup failed'));

            await controller.topUp(request, response, topUpDto);

            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Error !',
                message: 'Topup failed',
            });
        });
    });

    describe('balance', () => {
        it('should return the user\'s balance', async () => {
            const request = { headers: { authorization: 'Bearer valid-token' } } as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'getBalanceUser').mockResolvedValue({
                message: 'Balance Read Success',
                existingBalance: 1000,
            });

            await controller.balance(request, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Success',
                message: 'Balance Read Success',
                result: 1000,
            });
        });

        it('should return an error response on failure', async () => {
            const request = { headers: { authorization: 'Bearer invalid-token' } } as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'getBalanceUser').mockRejectedValue(new UnauthorizedException('Unauthorized'));

            await controller.balance(request, response);

            expect(response.status).toHaveBeenCalledWith(401);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Error !',
                message: 'Unauthorized',
            });
        });
    });

    describe('transfer', () => {
            it('should transfer funds and return a success response', async () => {
            const transferDto: TransferDto = { amount: 500, to_username: 'anotheruser' };
            const request = { headers: { authorization: 'Bearer valid-token' } } as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'transfer').mockResolvedValue({
                message: 'Transfer successful',
                existingBalance: 500,
            });

            await controller.transfer(request, response, transferDto);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Success',
                message: 'Transfer successful',
                excistingBalance: 500,
            });
        });

            it('should return an error response on failure', async () => {
            const transferDto: TransferDto = { amount: 500, to_username: 'invaliduser' };
            const request = { headers: { authorization: 'Bearer valid-token' } } as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'transfer').mockRejectedValue(new NotFoundException('User not found'));

            await controller.transfer(request, response, transferDto);

            expect(response.status).toHaveBeenCalledWith(404);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Error !',
                message: 'User not found',
            });
        });
    });

    describe('topTransactions', () => {
            it('should return top transactions for the user', async () => {
            const request = { headers: { authorization: 'Bearer valid-token' } } as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'getTransaction').mockResolvedValue([
                { userId: 1, amount: 1000 },
                { userId: 1, amount: 500 },
            ]);

            await controller.topTransactions(request, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Success',
                message: [
                { userId: 1, amount: 1000 },
                { userId: 1, amount: 500 },
                ],
            });
        });

            it('should return an error response on failure', async () => {
            const request = { headers: { authorization: 'Bearer valid-token' } } as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'getTransaction').mockRejectedValue(new UnauthorizedException('Unauthorized'));

            await controller.topTransactions(request, response);

            expect(response.status).toHaveBeenCalledWith(401);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Error !',
                message: 'Unauthorized',
            });
        });
    });

    describe('topTransactionsDebitUser', () => {
            it('should return top users by debit transactions', async () => {
            const request = { headers: { authorization: 'Bearer valid-token' } } as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'getTransactionByDebitUser').mockResolvedValue([
                { username: 'testuser', transacted_value: 500 },
                { username: 'anotheruser', transacted_value: 1000 },
            ]);

            await controller.topTransactionsDebitUser(request, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Success',
                message: [
                { username: 'anotheruser', transacted_value: 1000 },
                { username: 'testuser', transacted_value: 500 },
                ],
            });
        });

            it('should return an error response on failure', async () => {
            const request = { headers: { authorization: 'Bearer valid-token' } } as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'getTransactionByDebitUser').mockRejectedValue(new UnauthorizedException('Unauthorized'));

            await controller.topTransactionsDebitUser(request, response);

            expect(response.status).toHaveBeenCalledWith(401);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Error !',
                message: 'Unauthorized',
            });
        });
    });

    describe('listTransactionsUser', () => {
        it('should return a list of transactions for all users', async () => {
            const request = {} as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'getListTransactionUser').mockResolvedValue([
                { userId: 1, amount: 1000 },
                { userId: 2, amount: 500 },
            ]);

            await controller.listTransactionsUser(request, response);

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Success',
                message: [
                { userId: 1, amount: 1000 },
                { userId: 2, amount: 500 },
                ],
            });
        });

        it('should return an error response on failure', async () => {
            const request = {} as any;
            const response = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            jest.spyOn(service, 'getListTransactionUser').mockRejectedValue(new BadRequestException('Failed to fetch transactions'));

            await controller.listTransactionsUser(request, response);

            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith({
                status: 'Error !',
                message: 'Failed to fetch transactions',
            });
        });
    });
});
