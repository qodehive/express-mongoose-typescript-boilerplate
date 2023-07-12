import express, { RequestHandler, Router } from 'express';
import routesDetail from './UserRouter.details';
import { JwtController } from '../../Security/JwtController';
import { JwtTokenTypes } from '../../Security/JwtConfig';
import { validateDtoMiddleware } from '../../CommonHttpServer/RequestValidator';
import routeRegister from '../../Utils/RouteRegister';
import { UserController } from './UserController';
import * as userDto from "./User.dto"
const UserRouter: Router = express.Router();



if (routesDetail.length > 0) {
  routesDetail.forEach(route => {
    const method = route.method.toLowerCase();
    const args: RequestHandler[] = []
    if (route.authMiddleware) {
      args.push(JwtController.validateTokenMiddleware(JwtTokenTypes.AUTH_TOKEN, route.authMiddleware.authorizationRole))
    }

    if (route.validationMiddeleware) {
      const { dto, validate } = route.validationMiddeleware
      args.push(validateDtoMiddleware(userDto[dto], validate))
    }

    routeRegister(UserRouter, method, route.url, [...args, UserController[route.controller]])
  });
}

export default UserRouter