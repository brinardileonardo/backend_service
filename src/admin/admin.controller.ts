import { Controller, Get, Req, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Request, Response } from 'express';

@Controller('api/v1/')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('admin/list_user')
    async getAllUser(@Req() request:Request, @Res() response:Response): Promise<any> {
        try {
            const result = await this.adminService.getAllUser();
            return response.status(200).json({
                status: 'Success',
                message: result,
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
                    message: 'Internal Server Error!',
                });
            }
        }
    }
}