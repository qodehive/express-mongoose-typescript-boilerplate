import { AuthTokenI, JwtConfigMap, JwtTokenTypes } from "./JwtConfig";
import { JwtUtils } from "./JwtUtils";
import { Logger } from "../Utils/Logger";
import express, { NextFunction } from "express";
import { ApiResponseI, ResponseHandler } from "../CommonHttpServer/ResponseHandler";
import { AuthorizationRole, HttpStatusCodes } from "../CommonConstants";
import { RequestHandler } from "../CommonHttpServer/RequestHandler";
// import { BlackListedJwtEntity } from "../Redis/Entities/BlackListedJwtEntity";

const tag = "JwtController";

export const JwtController = {
  async createToken(
    tokenType: JwtTokenTypes,
    payloadBody: any,
    expiryTimeInSecs: number,
  ): Promise<string> {
    try {
      const jwtConfig = JwtConfigMap[tokenType];

      if (!jwtConfig.privateKey) {
        throw new Error("Missing JWT Private key");
      }

      payloadBody.tokenType = tokenType;
      return await JwtUtils.generateJWTToken(payloadBody, jwtConfig.privateKey, expiryTimeInSecs);
    } catch (error) {
      Logger.warn({ message: "createToken Failed", tag, error });
      throw error;
    }
  },

  validateTokenMiddleware: function (
    tokenType: JwtTokenTypes,
    allowedAuthRoles?: AuthorizationRole[],
    allowExpired = false,
  ) {
    return async (req: express.Request, res: express.Response, next: NextFunction) => {
      try {
        const jwtConfig = JwtConfigMap[tokenType];
        if (!jwtConfig.publicKey) {
          throw new Error("Missing JWT Public key");
        }

        let { errorMessage, isVerified, payload, errCode } = await JwtUtils.verifyJWTToken(
          RequestHandler.getAccessToken(req),
          jwtConfig.publicKey,
          allowExpired,
        );

        if (isVerified && payload && payload.tokenType != tokenType) {
          errorMessage = "Token Mismatch";
          isVerified = false;
          payload = null;
          errCode = HttpStatusCodes.UNAUTHORIZED;
        }

        if (
          isVerified &&
          tokenType === JwtTokenTypes.AUTH_TOKEN &&
          allowedAuthRoles &&
          allowedAuthRoles.length > 0 &&
          allowedAuthRoles.indexOf((payload as AuthTokenI).authorizationRole) == -1
        ) {
          errorMessage = "Access Forbidden";
          isVerified = false;
          payload = null;
          errCode = HttpStatusCodes.ACCESS_DENIED;
        }

        // if (
        //   isVerified &&
        //   tokenType === JwtTokenTypes.AUTH_TOKEN &&
        //   (payload as AuthTokenI).sessionId
        // ) {
        //   const isTokenBlacklisted: boolean =
        //     await BlackListedJwtEntity.isBlackListed(
        //       (payload as AuthTokenI).sessionId
        //     );
        //   if (isTokenBlacklisted) {
        //     errorMessage = "BlackListed";
        //     isVerified = false;
        //     payload = null;
        //     errCode = HttpStatusCodes.UNAUTHORIZED;
        //   }
        // }

        if (isVerified) {
          RequestHandler.setJwtPayload(req, payload);
          next();
        } else {
          const apiFailure: ApiResponseI = {
            message: errorMessage as string,
            status: errCode,
          };

          ResponseHandler.sendResponse(res, apiFailure);
        }
        return;
      } catch (error) {
        Logger.warn({
          message: "Validate Token Middleware Failed",
          tag,
          error,
        });

        const apiFailure: ApiResponseI = {
          message: "Failed to authorize",
          status: HttpStatusCodes.SERVER_ERROR,
          extraErrorData: error,
        };

        ResponseHandler.sendResponse(res, apiFailure);
      }
    };
  },

  async isUserLoggedIn(req: express.Request): Promise<boolean> {
    try {
      const jwtConfig = JwtConfigMap[JwtTokenTypes.AUTH_TOKEN];
      const token = RequestHandler.getAccessToken(req);
      const { isVerified, payload } = await JwtUtils.verifyJWTToken(
        token,
        jwtConfig.publicKey,
        false,
      );

      if (isVerified && (payload as AuthTokenI).authorizationRole == AuthorizationRole.USER) {
        RequestHandler.setJwtPayload(req, payload);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Logger.warn({ message: "createToken Failed", tag, error });
      throw error;
    }
  },
};
