import { Prisma } from "@prisma/client";

export class User implements Prisma.userCreateInput {
    id : number;
    username: string;
    createdAt: Date;
    role: string;
    password: string;
}
