import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WalletService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

    async validateUserByToken(token: string) {
        const decodedToken = this.jwtService.decode(token) as { username: string };
    
        if (!decodedToken || !decodedToken.username) {
          throw new UnauthorizedException('Token invalid or unauthorized');
        }
    
        const user = await this.prisma.user.findUnique({
          where: { username: decodedToken.username },
        });
    
        if (!user) {
          throw new UnauthorizedException('User not found');
        }
    
        return user;
    }

    async topUp(token: string, amount: number): Promise<any> {
        const user = await this.validateUserByToken(token);

        const [updateBalance, newMutasi] = await this.prisma.$transaction([
            this.prisma.wallet.update({
                where: { userId: user.id },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            }),
  
            this.prisma.mutation.create({
                data: {
                    userId: user.id,
                    type: 'credits',
                    amount: amount,
                    description: 'Top-up',
                    createdBy: user.username
                },
            }),
        ]);
    
        return {
            message: 'Topup successful',
            newBalance: updateBalance.balance,
        };
    }

    async getBalanceUser(token: string): Promise<any> {
        const user = await this.validateUserByToken(token);

        const balance = await this.prisma.wallet.findUnique({ 
            where: { userId: user.id },
            select: {
                balance: true
            }
        });

        return {
            message: 'Balance Read Success',
            existingBalance: balance
        };
    }

    async transfer(token: string, amount: number, to_username: string): Promise<any> {
        const user = await this.validateUserByToken(token);

        if(user.username === to_username.toLowerCase()){
            throw new BadRequestException('You cannot transfer to your own wallet.');
        }

        const wallet = await this.prisma.wallet.findUnique({ 
            where: { userId: user.id },
            select: {
                balance: true
            }
        });
        const currentBalance = wallet.balance;
        const balanceNow = currentBalance.toNumber() - amount;

        if (amount <= 0 || amount >= 10000000) {
            throw new BadRequestException('Invalid topup amount');
        }

        if (balanceNow < 0) {
            throw new BadRequestException('Insufficient balance');
        }

        const targetUser = await this.prisma.user.findUnique({
            where: {
                username: to_username.toLowerCase()
            },
        });
    
        if (!targetUser) {
            throw new NotFoundException('Destination user not found');
        }
    
        const [updateBalance, newMutasi] = await this.prisma.$transaction([
            this.prisma.wallet.update({
                where: { userId: user.id },
                data: {
                    balance: {
                        decrement: amount,
                    },
                },
            }),

            this.prisma.wallet.update({
                where: { userId: targetUser.id },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            }),
  
            this.prisma.mutation.create({
                data: {
                    userId: targetUser.id,
                    type: 'credits',
                    amount: amount,
                    description: 'transfers to the user',
                    createdBy: user.username,
                    sourceUserId: user.id,
                    targetUserId: targetUser.id
                },
            }),

            this.prisma.mutation.create({
                data: {
                    userId: user.id,
                    type: 'debits',
                    amount: -amount,
                    description: 'transfers froms the user',
                    createdBy: user.username,
                    sourceUserId: user.id,
                    targetUserId: targetUser.id
                },
            }),
        ]);
    
        return {
            message: 'Transfer successful',
            existingBalance: updateBalance.balance,
        };
    }

    async getTransaction(token: string): Promise<any> {
        const user = await this.validateUserByToken(token);

        const transactions = await this.prisma.mutation.findMany({
            where: { userId: user.id },
            select: {
                userId: true,
                amount: true
            },
            orderBy: [
                {
                    amount: 'desc',
                },
            ],
            take: 10,
        });
    
        if (transactions.length === 0) {
            return {
                message: 'No transactions found for this user.',
                transactions: [],
            };
        }
    
        const sortedTransactions = transactions.map(transaction => ({
            ...transaction,
            amount: transaction.amount.toNumber(),
            absoluteValue: Math.abs(transaction.amount.toNumber()),
        }))
        .sort((a, b) => b.absoluteValue - a.absoluteValue)
        .map(transaction => ({
            ...transaction,
            amount: transaction.amount,
        }));

        return {
            transactions: sortedTransactions,
        };
    }

    async getTransactionByDebitUser(token: string): Promise<{ username: string, transacted_value: number }[]> {
        const user = await this.validateUserByToken(token);

        const aggregatedDebits = await this.prisma.mutation.groupBy({
            by: ['sourceUserId'],
            _sum: {
                amount: true,
            },
            where: {
                amount: {
                    lt: 0,
                },
            },
        });

        const sortedDebits = aggregatedDebits.map(debit => ({
            sourceUserId: debit.sourceUserId,
            transacted_value: Math.abs(debit._sum.amount.toNumber()),
        })).sort((a, b) => b.transacted_value - a.transacted_value).slice(0, 10);
      

        const topUsers = await this.prisma.user.findMany({
            where: {
                id: {
                    in: sortedDebits.map(debit => debit.sourceUserId),
                },
            },
            select: {
                id : true,
                username: true,
            },
        });
      
        return sortedDebits.map(debit => ({
            username: topUsers.find(user => user.id === debit.sourceUserId)?.username || '',
            transacted_value: debit.transacted_value,
        }));
    }  

    async getListTransactionUser(): Promise<any> {
        return this.prisma.mutation.findMany({
            select: {
                id: true,
                type: true,
                amount: true,
                description: true,
                createdAt: true,
                user: {
                    select: {
                        username: true
                    },
                },
            },
        });
    }  
}