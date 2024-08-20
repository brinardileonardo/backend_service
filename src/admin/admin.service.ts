import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Admin } from './admin.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService){}

    async validatePassword(password: string): Promise<void> {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      
        if (!passwordRegex.test(password)) {
          throw new BadRequestException(
            'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character'
          );
        }
    }
      
    async createAdmin(data: Admin): Promise<Admin>{
        const email = data.email;
        const nameLower = data.name.toLowerCase();

        const existing = await this.prisma.admin.findFirst({
            where: {
              OR: [
                { email: email },
                { name: nameLower },
              ],
            },
          });
       
        if (existing) {
            throw new ConflictException('username already exists');
        }

        await this.validatePassword(data.password);

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);    

        return this.prisma.admin.create({
            data: {
                ...data,
                name: data.name,
                password: hashedPassword,
                role: 'admin',
                createdAt: new Date()
            },
        })
    }

    async getAllUser(): Promise<any>{
        return this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                createdAt: true,
                wallet: {
                    select: {
                        balance: true,
                        updatedAt: true
                    },
                },
            },
        });
    }
}