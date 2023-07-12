import { AuthorizationRole } from "../../CommonConstants";
import { UserController } from "./UserController"
import * as userDto from "./User.dto"

export interface IAuthRouteDetails {
    name: string;
    method: "get" | "post" | "put" | "delete";
    url: string;
    authMiddleware?: {
        authorizationRole: AuthorizationRole[]
    }
    validationMiddeleware?: {
        dto: keyof typeof userDto
        validate: "body" | "params" | "query"
    }
    controller: keyof typeof UserController;
}

const routesDetail: IAuthRouteDetails[] = [

    {
        name: "usersListApi",
        method: "get",
        url: "/all",
        authMiddleware: {
            authorizationRole: [AuthorizationRole.ADMIN]
        },
        controller: "getUsers"

    },
    {
        name: "userProfileApi",
        method: "get",
        url: "/:userId",
        authMiddleware: {
            authorizationRole: [AuthorizationRole.USER]
        },
        validationMiddeleware: {
            dto: "GetUserProfileByIdDto",
            validate: "params"

        },
        controller: "getUserProfile"

    }
]

export default routesDetail