import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsEmail, IsEnum, IsMongoId, IsBoolean } from "class-validator";
import { UserRole } from "../../CommonConstants";
import { IsOptional2 } from "../Common.dto";
import "reflect-metadata";
import { UserI } from "../User/User.dto";

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.toLowerCase().trim() : value))
  emailId!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsBoolean()
  @IsOptional2()
  byPass?: boolean;
}

export class RegisterDto {
  @IsOptional2()
  @IsEnum(UserRole)
  userRole: UserRole = UserRole.USER;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.toLowerCase().trim() : value))
  emailId!: string;

  @IsOptional2()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  firstName?: string;

  @IsOptional2()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  lastName?: string;

  @IsOptional2()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  userName?: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}

export class RefreshAccessTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string
}


export interface RegisterResponseI {
  user: UserI;
  password: string;
}


export interface LoginOtpVerifyResponseI {
  user: UserI;
  accessToken: string;
  refreshToken: string;
}
