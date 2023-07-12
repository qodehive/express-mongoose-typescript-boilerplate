import { AuthorizationRole } from "../../CommonConstants";
import { JwtTokenTypes } from "../../Security/JwtConfig";
import { AuthController } from "./AuthController"
import * as authDto from "./Auth.dto"

interface IAuthRouteDetails {
    name: string;
    method: "get" | "post" | "put" | "delete";
    url: string;
    authMiddleware?: {
        authorizationRole: AuthorizationRole[]
    }
    validationMiddeleware?: {
        dto: keyof typeof authDto
        validate: "body" | "params" | "query"
    }
    controller: keyof typeof AuthController;
}
let routesDetail: IAuthRouteDetails[] = []
routesDetail = [
    {
        name: "registerApi",
        method: "post",
        url: "/register",
        validationMiddeleware: {
            dto: "RegisterDto",
            validate: "body"
        },
        controller: "register"

    },
    {
        name: "loginApi",
        method: "post",
        url: "/login",
        validationMiddeleware: {
            dto: "LoginDto",
            validate: "body"
        },
        controller: "login"

    },
    {
        name: "updatePasswordApi",
        method: "post",
        url: "/update-password",
        validationMiddeleware: {
            dto: "UpdatePasswordDto",
            validate: "body"
        },
        controller: "updatePassword"

    },
    {
        name: "refreshAccessTokenApi",
        method: "post",
        url: "/refresh/access-token",
        validationMiddeleware: {
            dto: "RefreshAccessTokenDto",
            validate: "body"
        },
        controller: "refreshAccessToken"

    },

]

export default routesDetail