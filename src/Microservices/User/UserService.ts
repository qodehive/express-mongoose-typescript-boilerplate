/* eslint-disable indent */
import {
  HttpStatusCodes,
} from "../../CommonConstants";
import { ApiResponseI } from "../../CommonHttpServer/ResponseHandler";
import { IUserEntity, UserModel } from "../../Database/Entities/UserEntity";
import { Logger } from "../../Utils/Logger";
import {
  GetUserProfileResponseI,
  UserI,

} from "./User.dto";
import { getPaginationResult } from "../../Database/MongoUtils";

const tag = "UserController";

export const UserService = {

  async getUserProfile(userId: string): Promise<ApiResponseI> {
    try {
      const user = await UserModel().findOne({ _id: userId });
      // .populate({ path: "groupId", model: GroupModel() });

      if (!user) {
        return {
          status: HttpStatusCodes.NOT_FOUND,
          message: "Not Found",
        };
      }

      const data: GetUserProfileResponseI = {
        user: this.getUserResponseDto(user),
      };

      Logger.info({ message: "getUserProfile Success", data: { userId }, tag });
      return {
        data,
        status: HttpStatusCodes.OK,
        message: "Profile Fetched",
      };
    } catch (error) {
      Logger.warn({ message: "getUserProfile Failed", error, tag });
      throw error;
    }
  },

  async getUsers(): Promise<ApiResponseI> {
    try {
      const users = await UserModel().find()
      const usersObj = users.map((user) => {
        return this.getUserResponseDto(user)
      })
      const paginateResut = await getPaginationResult({ currentPage: 1, pageSize: 10, model: UserModel(), filter: {} })
      Logger.info({
        message: "Fetched all",
        data: { usersObj, paginateResut: paginateResut },
        tag,
      });

      return {
        status: HttpStatusCodes.OK,
        message: "Fetched all",
        data: { usersObj, paginateResut },
      };
    } catch (error) {
      Logger.warn({ message: "Fetching Failed", error, tag });

      throw error;
    }

  },

  getUserResponseDto(user: IUserEntity): UserI {
    return {
      id: user._id.toString(),
      emailId: user.emailId,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  },
};
