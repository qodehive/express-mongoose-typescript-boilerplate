import { IsNotEmpty, IsString, IsEmail, IsEnum, IsMongoId, IsBoolean } from "class-validator";
import "reflect-metadata";

export class GetUserProfileByIdDto {
  @IsMongoId()
  @IsNotEmpty()
  userId!: string;
}

export interface UserI {
  id: string;
  emailId: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserProfileResponseI {
  user: UserI;
}

