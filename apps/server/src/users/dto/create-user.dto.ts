import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "john@example.com", description: "Email address" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "John Doe", description: "Full name" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "securePassword123", description: "Password" })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
