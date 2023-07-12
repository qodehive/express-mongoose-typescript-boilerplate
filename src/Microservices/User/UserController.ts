import * as express from 'express';
import { UserService } from './UserService';
import { ResponseHandler } from '../../CommonHttpServer/ResponseHandler';
import { GetUserProfileByIdDto } from './User.dto';


export const UserController = {
    async getUserProfile(req: express.Request, res: express.Response) {
        try {
            const response = await UserService.getUserProfile(
                (req.params as any as GetUserProfileByIdDto).userId,
            );
            ResponseHandler.sendResponse(res, response);
        } catch (error) {
            ResponseHandler.sendErrorResponse(res, error);
        }
    },
    async getUsers(req: express.Request, res: express.Response) {
        try {
            const response = await UserService.getUsers();
            ResponseHandler.sendResponse(res, response);
        } catch (error) {
            ResponseHandler.sendErrorResponse(res, error);
        }
    }
}
