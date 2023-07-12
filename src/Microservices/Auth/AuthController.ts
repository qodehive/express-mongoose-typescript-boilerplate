import * as express from 'express';
import { ResponseHandler } from '../../CommonHttpServer/ResponseHandler';
import { RequestHandler } from '../../CommonHttpServer/RequestHandler';
import AuthService from './AuthService';



export const AuthController = {
  async register(req: express.Request, res: express.Response) {
    try {
      const response = await AuthService.registerUser(req.body);
      ResponseHandler.sendResponse(res, response);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, error);
    }
  },
  async login(req: express.Request, res: express.Response) {
    try {
      const response = await AuthService.login(req.body);

      ResponseHandler.sendResponse(res, response);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, error);
    }
  },
  async updatePassword(req: express.Request, res: express.Response) {
    try {
      const response = await AuthService.updatePassword(
        req.body,
        RequestHandler.getJwtPayload(req),
      );
      ResponseHandler.sendResponse(res, response);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, error);
    }
  }
  ,
  async refreshAccessToken(req: express.Request, res: express.Response) {
    try {
      console.log(" req.body", req.body)
      const response = await AuthService.RefreshAccessToken(
        req.body
      );
      ResponseHandler.sendResponse(res, response);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, error);
    }
  }
}





