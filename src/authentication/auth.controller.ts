import { Controller,Post,Body,Req,Res, BadRequestException, UnauthorizedException, Get } from "@nestjs/common";
import { Request,Response } from 'express'
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";
import { RegisterAdminDto } from "./dto/register-admin.dto";
import { LoginAdminDto } from "./dto/login-admin.dto";
import { SessionDto } from "./dto/sesion-user.dto";

@Controller('api/v1/auth')
export class AuthController{
    constructor(private readonly authService:AuthService){}

    @Post('/login')
    async login(@Req() request:Request, @Res() response :Response, @Body() loginDto: LoginDto):Promise<any>{
        try{
            const result = await this.authService.login(loginDto);
            return response.status(200).json({
                status: 'Ok!',
                message: 'Successfully login!',
                name : result.name,
                role : result.role,
                token: result.token
            })
        }catch(err){
            if (err.status){
                return response.status(err.status).json({
                    status: 'Error !',
                    message: err.response.message,
                });
            }else{
                return response.status(500).json({
                    status: 'Error!',
                    message: 'Internal Server Error!',
                });
            }
        }
    }

    @Post('/user_session')
    async userSession(@Req() request:Request, @Res() response :Response, @Body() sessionDto: SessionDto):Promise<any>{
        try{
            const result = await this.authService.userSession(sessionDto);
            return response.status(200).json({
                status: 'Ok!',
                message: 'Successfully login!',
                name : result.name,
                role : result.role,
                token: result.token
            })
        }catch(err){
            if (err.status){
                return response.status(err.status).json({
                    status: 'Error !',
                    message: err.response.message,
                });
            }else{
                return response.status(500).json({
                    status: 'Error!',
                    message: 'Internal Server Error!',
                });
            }
        }
    }

    @Post('/register')
    async register(@Req() request:Request, @Res() response :Response, @Body() registerDto: RegisterUserDto):Promise<any>{
        try {
            if (!registerDto.username) {
                throw new BadRequestException();
            }

            const result = await this.authService.register(registerDto);
            return response.status(200).json({
                status: 'Ok!',
                message: 'Successfully register user!',
                result: result,
            });
        } catch (err) {
            console.log(err);
            if (err.status){
                return response.status(err.status).json({
                    status: 'Error !',
                    message: err.response.message,
                });
            }else{
                return response.status(500).json({
                    status: 'Error!',
                    message: 'Internal Server Error!',
                });
            }
        }
    }    

    @Post('/admin/register')
    async registerAdmin(@Req() request:Request, @Res() response :Response, @Body() registerAdminDto: RegisterAdminDto):Promise<any>{
        try {
            if (!registerAdminDto.username || !registerAdminDto.email || !registerAdminDto.password) {
                throw new BadRequestException();
            }

            const result = await this.authService.registerAdmin(registerAdminDto);
            return response.status(200).json({
                status: 'Ok!',
                message: 'Successfully register admin !',
                result: result,
            });
        } catch (err) {
            if (err.status){
                return response.status(err.status).json({
                    status: 'Error !',
                    message: err.response.message,
                });
            }else{
                return response.status(500).json({
                    status: 'Error!',
                    message: 'Internal Server Error!'                
                });
            }
        }
    }   

    @Post('admin/login')
    async loginAdmin(@Req() request:Request, @Res() response :Response, @Body() loginAdminDto: LoginAdminDto):Promise<any>{
        try{
            const result = await this.authService.loginAdmin(loginAdminDto);
            return response.status(200).json({
                status: 'Ok!',
                message: 'Successfully login admin !',
                name: result.name,
                role: result.role,
                token: result.token
            })
        }catch(err){
            if (err.status){
                return response.status(err.status).json({
                    status: 'Error !',
                    message: err.response.message,
                });
            }else{
                return response.status(500).json({
                    status: 'Error!',
                    message: 'Internal Server Error!',
                });
            }
        }
    }
}