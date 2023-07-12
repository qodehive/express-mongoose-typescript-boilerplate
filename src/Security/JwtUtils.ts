import * as jwt from "jsonwebtoken";
import { HttpStatusCodes } from "../CommonConstants";
import { Logger } from "../Utils/Logger";

export interface JWTTokenVerificationResult {
  isVerified: boolean;
  errorMessage: string | null;
  payload: any;
  errCode: HttpStatusCodes;
}

const JWTAlgorithm: jwt.Algorithm = "RS256";

const tag = "JwtHelper";

export const JwtUtils = {
  verifyJWTToken(
    token: string | null,
    pubKey: string,
    allowExpired: boolean,
  ): Promise<JWTTokenVerificationResult> {
    return new Promise(async (resolve) => {
      if (!token) {
        return resolve({
          isVerified: false,
          errorMessage: "Not Authorized",
          payload: null,
          errCode: HttpStatusCodes.UNAUTHORIZED,
        });
      } else {
        jwt.verify(token, pubKey, { algorithms: [JWTAlgorithm] }, (err, payload) => {
          if (err || !payload) {
            if (err && err instanceof jwt.TokenExpiredError) {
              if (allowExpired) {
                resolve({
                  isVerified: true,
                  errorMessage: null,
                  payload: this.decodeJWTToken(token),
                  errCode: 0,
                });
              } else {
                return resolve({
                  isVerified: false,
                  errorMessage: "Expired",
                  payload: null,
                  errCode: HttpStatusCodes.UNAUTHORIZED,
                });
              }
            } else {
              return resolve({
                isVerified: false,
                errorMessage: "Not Authorized",
                payload: null,
                errCode: HttpStatusCodes.UNAUTHORIZED,
              });
            }
          } else {
            return resolve({
              isVerified: true,
              errorMessage: null,
              payload,
              errCode: 0,
            });
          }
        });
      }
    });
  },

  generateJWTToken(payload: any, pvtKey: string, expiryTimeStampInSecs?: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const signOptions: jwt.SignOptions = {
        algorithm: JWTAlgorithm,
      };

      if (expiryTimeStampInSecs !== undefined) {
        signOptions.expiresIn = expiryTimeStampInSecs;
      }

      jwt.sign(payload, pvtKey, signOptions, function (error, token) {
        if (error) {
          Logger.warn({ message: "generateJWTToken Failed", tag, error });
          reject(error);
        } else {
          resolve(token as string);
        }
      });
    });
  },

  decodeJWTToken(token: string | null): any | null {
    try {
      if (token) {
        return jwt.decode(token);
      }
      return null;
    } catch (error) {
      Logger.warn({ message: "decodeJWTToken Failed", tag, error });
      return null;
    }
  },
};
