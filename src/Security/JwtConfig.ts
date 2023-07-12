import { AuthorizationRole } from "../CommonConstants";
import { ServerConfig } from "../serverConfig";

export enum JwtTokenTypes {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
  RESET_PASSWORD = "RESET_PASSWORD",
  VERIFY_EMAIL = "VERIFY_EMAIL",
  AUTH_TOKEN = "AUTH_TOKEN",
}

interface JwtConfig {
  expiryTimeInSecs?: number;
  privateKey: string;
  publicKey: string;
}

type JwtConfigMapI = { [key in JwtTokenTypes]: JwtConfig };

export const JwtConfigMap: JwtConfigMapI = {
  [JwtTokenTypes.AUTH_TOKEN]: {
    privateKey: decodeBase64String(ServerConfig.JWT_CONFIG.AUTH_PRIVATE_BASE64),
    publicKey: decodeBase64String(ServerConfig.JWT_CONFIG.AUTH_PUBLIC_BASE64),
    // expiryTimeInSecs: 30 * 60,
  },
  [JwtTokenTypes.REFRESH]: {
    privateKey: decodeBase64String(ServerConfig.JWT_CONFIG.AUTH_PRIVATE_BASE64),
    publicKey: decodeBase64String(ServerConfig.JWT_CONFIG.AUTH_PUBLIC_BASE64),
    // expiryTimeInSecs: 30 * 60,
  },
  [JwtTokenTypes.ACCESS]: {
    privateKey: decodeBase64String(ServerConfig.JWT_CONFIG.AUTH_PRIVATE_BASE64),
    publicKey: decodeBase64String(ServerConfig.JWT_CONFIG.AUTH_PUBLIC_BASE64),
    // expiryTimeInSecs: 30 * 60,
  },
  [JwtTokenTypes.RESET_PASSWORD]: {
    privateKey: decodeBase64String(ServerConfig.JWT_CONFIG.AUTH_PRIVATE_BASE64),
    publicKey: decodeBase64String(ServerConfig.JWT_CONFIG.AUTH_PUBLIC_BASE64),
    // expiryTimeInSecs: 30 * 60,
  },
  [JwtTokenTypes.VERIFY_EMAIL]: {
    privateKey: decodeBase64String(ServerConfig.JWT_CONFIG.AUTH_PRIVATE_BASE64),
    publicKey: decodeBase64String(ServerConfig.JWT_CONFIG.AUTH_PUBLIC_BASE64),
    // expiryTimeInSecs: 30 * 60,
  },

};

function decodeBase64String(base64: string): string {
  return Buffer.from(base64, "base64").toString("ascii");
}

export interface AuthTokenI {
  userId: string;
  authorizationRole: AuthorizationRole;
}
