import { IsInt, Min, Max } from 'class-validator';

export class TopUpDto {
  @IsInt()
  @Min(1)
  @Max(9999999)
  amount: number;
}