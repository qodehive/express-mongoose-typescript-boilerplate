import express, { RequestHandler, Router } from 'express';
import routesDetail from './AuthRouter.details';
import { JwtController } from '../../Security/JwtController';
import { JwtTokenTypes } from '../../Security/JwtConfig';
import { validateDtoMiddleware } from '../../CommonHttpServer/RequestValidator';
import routeRegister from '../../Utils/RouteRegister';
import { AuthController } from './AuthController';
import * as AuthDto from "./Auth.dto"
const AuthRouter: Router = express.Router();



if (routesDetail.length > 0) {
  routesDetail.forEach(route => {
    const method = route.method.toLowerCase();
    const args: RequestHandler[] = []
    if (route.authMiddleware) {
      args.push(JwtController.validateTokenMiddleware(JwtTokenTypes.AUTH_TOKEN, route.authMiddleware.authorizationRole))
    }

    if (route.validationMiddeleware) {
      const { dto, validate } = route.validationMiddeleware
      args.push(validateDtoMiddleware(AuthDto[dto], validate))
    }

    routeRegister(AuthRouter, method, route.url, [...args, AuthController[route.controller]])
  });
}

export default AuthRouter