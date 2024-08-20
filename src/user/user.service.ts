import { ConflictException, Injectable } from '@nestjs/common';
import { user } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}

    async createUser(data: user): Promise<user> {
        const usernameLowerCase = data.username.toLowerCase();

        const existing = await this.prisma.user.findUnique({
            where: {
                username: usernameLowerCase,
            },
        });
    
        if (existing) {
          throw new ConflictException('username already exists');
        }

        return this.prisma.user.create({
            data: {
                ...data,
                username: usernameLowerCase,
                password: data.password,
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
    }
}
