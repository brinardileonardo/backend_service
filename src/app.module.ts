import { Module } from '@nestjs/common';
import { AuthModule } from './authentication/auth.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [UserModule, AuthModule, WalletModule, AdminModule],
  controllers: [],
  providers: [],
})
export class AppModule {}