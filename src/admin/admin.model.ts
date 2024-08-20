import { Prisma } from "@prisma/client";

export class Admin implements Prisma.adminCreateInput {
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    role: string;
}