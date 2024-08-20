import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    username: string;
}