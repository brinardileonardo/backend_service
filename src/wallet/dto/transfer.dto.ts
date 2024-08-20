import { IsInt, Min, Max, IsString, Length } from 'class-validator';

export class TransferDto {
  @IsInt()
  @Min(1)
  @Max(9999999)
  amount: number;

  @IsString()
  @Length(5,10)
  to_username: string;
}