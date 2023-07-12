export const CustomRequestProperty = {
  JWT_TOKEN: "JWT_TOKEN",
};

export enum HttpStatusCodes {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  ACCESS_DENIED = 403,
  SERVER_ERROR = 500,
  OK = 200,
}

export interface PaginationResult {
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalRecords: number;
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export enum AuthorizationRole {
  USER = "CLIENT",
  ADMIN = "ADMIN",
}

export enum SortBy {
  ASC = 1,
  DESC = -1,
}

export enum DevicePlatform {
  ANDROID = "ANDROID",
  IPHONE = "IPHONE",
}

export enum SessionStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  LOGGED_OUT = "LOGGED_OUT",
}

export enum OtpType {
  LOGIN = "LOGIN",
}

export enum OtpStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
}

export const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000;
export const USER_JWT_EXPIRY_IN_SECS = 60;
export const ADMIN_JWT_EXPIRY_IN_SECS = 24 * 60 * 60;

export const DEFAULT_TIMEZONE = "America/Denver";
