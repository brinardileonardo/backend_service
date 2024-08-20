import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import { LoginDto } from "./dto/login-user.dto";
import { UserService } from "src/user/user.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { User } from "src/user/user.model";
import { RegisterAdminDto } from "./dto/register-admin.dto";
import { AdminService } from "src/admin/admin.service";
import { Admin } from "src/admin/admin.model";
import { LoginAdminDto } from "./dto/login-admin.dto";
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SessionDto } from "./dto/sesion-user.dto";

@Injectable()
export class AuthService{
    constructor(
        private readonly prismaService: PrismaService,
        private jwtService: JwtService,
        private readonly userService: UserService,
        private readonly adminService: AdminService
    ){}

    async login(loginDto: LoginDto):Promise<any>{        
        const usernameLowerCase = loginDto.username.toLowerCase();

        const user = await this.prismaService.user.findUnique({
            where: {
                username : usernameLowerCase
            }
        })

        if(!user){
            throw new NotFoundException('user not found')
        }
    
        const password = loginDto.password;
        const isPasswordValid = await bcrypt.compare(password, user.password);
    
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return {
            name : user.username,
            role : user.role,
            token : this.jwtService.sign({username: usernameLowerCase})
        }
    }

    async userSession(sessionDto: SessionDto):Promise<any>{        
        const usernameLowerCase = sessionDto.username.toLowerCase();

        const user = await this.prismaService.user.findUnique({
            where: {
                username : usernameLowerCase
            }
        })

        if(!user){
            throw new NotFoundException('user not found')
        }

        return {
            name : user.username,
            role : user.role,
            token : this.jwtService.sign({username: usernameLowerCase})
        }
    }

    async register (createDto: RegisterUserDto): Promise<any>{
        const createUser = new User();
        createUser.username = createDto.username.toLowerCase();

        const password = crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        createUser.password = hashedPassword;

        const user = await this.userService.createUser(createUser);

        return {
            username: user.username,
            password: password,
            role: user.role,
            token: this.jwtService.sign({ username: user.username }),
        };
    }

    async registerAdmin (createAdminDto: RegisterAdminDto): Promise<any>{
        const createAdmin = new Admin();
        createAdmin.name = createAdminDto.username.toLowerCase();
        createAdmin.email = createAdminDto.email;
        createAdmin.password = createAdminDto.password;

        const admin = await this.adminService.createAdmin(createAdmin);

        return {
            token: this.jwtService.sign({ name: admin.name }),
        };
    }

    async loginAdmin(loginAdminDto: LoginAdminDto):Promise<any>{     
        const name = loginAdminDto.username.toLowerCase();

        const admin = await this.prismaService.admin.findFirst({
            where: {
                name : name
            }
        })
    
        if (!admin) {
            throw new UnauthorizedException('Invalid email or password');
        }
    
        const password = loginAdminDto.password;
        const isPasswordValid = await bcrypt.compare(password, admin.password);
    
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return {
            name : admin.name,
            role : admin.role,
            token : this.jwtService.sign({ name : admin.name })
        };
    }
}