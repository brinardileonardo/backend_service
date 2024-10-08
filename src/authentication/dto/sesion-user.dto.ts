import { IsNotEmpty, IsString } from 'class-validator';

export class SessionDto {
  @IsNotEmpty()
  @IsString()
  username: string;
}