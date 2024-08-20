import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TopUpDto } from './dto/topup.dto';
import { JwtAuthGuard } from 'src/authentication/auth.guard';
import { Request,Response } from 'express';
import { TransferDto } from './dto/transfer.dto';

@Controller('api/v1/')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @UseGuards(JwtAuthGuard)
    @Post('topup')
    async topUp(@Req() request: Request, @Res() response: Response,  @Body() topUpDto: TopUpDto) {
        const token = request.headers.authorization?.split(' ')[1];
      
        try {
            const result = await this.walletService.topUp(token, topUpDto.amount);
            return response.status(200).json({
                status: 'Success',
                message: result.message,
                newBalance: result.newBalance,
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

    @UseGuards(JwtAuthGuard)
    @Get('balance')
    async balance(@Req() request: Request, @Res() response: Response) {
        const token = request.headers.authorization?.split(' ')[1];
      
        try {
            const result = await this.walletService.getBalanceUser(token);
            return response.status(200).json({
                status: 'Success',
                message: result.message,
                result: result.existingBalance,
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

    @UseGuards(JwtAuthGuard)
    @Post('transfer')
    async transfer(@Req() request: Request, @Res() response: Response,  @Body() transferDto: TransferDto ) {
        const token = request.headers.authorization?.split(' ')[1];
      
        try {
            const result = await this.walletService.transfer(token, transferDto.amount, transferDto.to_username);
            return response.status(200).json({
                status: 'Success',
                message: result.message,
                excistingBalance: result.existingBalance,
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

    @UseGuards(JwtAuthGuard)
    @Get('top_transactions_for_user')
    async topTransactions(@Req() request: Request, @Res() response: Response) {
        const token = request.headers.authorization?.split(' ')[1];
      
        try {
            const result = await this.walletService.getTransaction(token);
            return response.status(200).json({
                status: 'Success',
                message: result
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

    @UseGuards(JwtAuthGuard)
    @Get('/top_users')
    async topTransactionsDebitUser(@Req() request: Request, @Res() response: Response) {
        const token = request.headers.authorization?.split(' ')[1];
      
        try {
            const result = await this.walletService.getTransactionByDebitUser(token);
            return response.status(200).json({
                status: 'Success',
                message: result
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

    @Get('/list_trx')
    async listTransactionsUser(@Req() request: Request, @Res() response: Response) {
        try {
            const result = await this.walletService.getListTransactionUser();
            return response.status(200).json({
                status: 'Success',
                message: result
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