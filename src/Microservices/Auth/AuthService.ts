import { AuthorizationRole, HttpStatusCodes, REFRESH_TOKEN_EXPIRY, USER_JWT_EXPIRY_IN_SECS, UserStatus } from "../../CommonConstants";
import { ApiResponseI } from "../../CommonHttpServer/ResponseHandler";
import { IUserEntity, UserModel } from "../../Database/Entities/UserEntity";
import { AuthTokenI, JwtConfigMap, JwtTokenTypes } from "../../Security/JwtConfig";
import { JwtController } from "../../Security/JwtController";
import { JwtUtils } from "../../Security/JwtUtils";
import { PasswordUtil } from "../../Security/PasswordUtil";
import { Logger } from "../../Utils/Logger";
import { RandomUtil } from "../../Utils/RandomUtil";
import { UserService } from "../User/UserService";
import { LoginDto, LoginOtpVerifyResponseI, RefreshAccessTokenDto, RegisterDto, RegisterResponseI, UpdatePasswordDto } from "./Auth.dto";


const tag = "AuthService";

export default class AuthService {

    static async login(input: LoginDto): Promise<ApiResponseI> {
        try {
            const { emailId, password } = input;
            const user = await UserModel().findOne({
                emailId,
            });

            if (!user) {
                return {
                    status: HttpStatusCodes.BAD_REQUEST,
                    message: "This user doesn't exist",
                };
            }

            const isValid: boolean = await PasswordUtil.checkHash({
                password,
                hashBase64: user.passwordHash,
            });

            if (!isValid) {
                return {
                    status: HttpStatusCodes.BAD_REQUEST,
                    message: "Please check your password.",
                };
            }

            // const refreshToken = RandomUtil.getRandomString(32, true);

            const payload: AuthTokenI = {
                userId: user._id.toString(),
                authorizationRole: AuthorizationRole.USER,
            };

            const refreshToken = await JwtController.createToken(JwtTokenTypes.REFRESH, { userId: user._id.toString() }, REFRESH_TOKEN_EXPIRY)

            const accessToken = await JwtController.createToken(
                JwtTokenTypes.AUTH_TOKEN,
                payload,
                USER_JWT_EXPIRY_IN_SECS,
            );

            const data: LoginOtpVerifyResponseI = {
                user: UserService.getUserResponseDto(user),
                accessToken,
                refreshToken,
            };

            Logger.info({ message: "User Login Success", data: {}, tag });

            return {
                status: HttpStatusCodes.OK,
                message: "Logged in",
                data,
            };

        } catch (error) {
            Logger.warn({ message: "Login User Failed", error, tag });

            throw error;
        }
    }

    public static async registerUser(input: RegisterDto): Promise<ApiResponseI> {
        try {
            const { emailId, firstName, lastName, userRole, userName } = input;

            const existingUser: IUserEntity | null = await UserModel().findOne({
                emailId,
            });

            if (existingUser) {
                return {
                    status: HttpStatusCodes.BAD_REQUEST,
                    message: "User with this email already exists",
                };
            }

            const password = RandomUtil.getRandomString(8, false);
            const passwordHash: string = await PasswordUtil.getHash(password);

            const newUser = new (UserModel())({
                emailId,
                userRole,
                userStatus: UserStatus.ACTIVE,
                userName,
                passwordHash,
                firstName,
                lastName,
            });

            await newUser.save();

            const data: RegisterResponseI = {
                user: UserService.getUserResponseDto(newUser),
                password,
            };

            Logger.info({ message: "User Registered Successfully", data, tag });
            return {
                status: HttpStatusCodes.OK,
                message: "User Registered",
                data,
            };
        } catch (error) {
            Logger.warn({ message: "Register User Failed", error, tag });

            throw error;
        }
    }

    static async updatePassword(input: UpdatePasswordDto, payload: AuthTokenI): Promise<ApiResponseI> {
        try {
            const { newPassword } = input;
            const { userId } = payload;
            const user = await UserModel().findById(userId);

            if (!user) {
                return {
                    status: HttpStatusCodes.NOT_FOUND,
                    message: "This user doesn't exist",
                };
            }

            user.passwordHash = await PasswordUtil.getHash(newPassword);

            await user.save();

            Logger.info({
                message: "Password Updated Success",
                data: { payload },
                tag,
            });

            return {
                status: HttpStatusCodes.OK,
                message: "Password Updated",
                data: {},
            };
        } catch (error) {
            Logger.warn({ message: "Password Updated Failed", error, tag });

            throw error;
        }
    }

    public static async RefreshAccessToken(input: RefreshAccessTokenDto) {
        try {
            const { refreshToken } = input
            console.log("refreshToken", refreshToken)
            const tokenVerificationResult = await JwtUtils.verifyJWTToken(refreshToken, JwtConfigMap[JwtTokenTypes.REFRESH].publicKey, false)
            if (!tokenVerificationResult.isVerified && tokenVerificationResult.errorMessage) {
                return {
                    status: HttpStatusCodes.BAD_REQUEST,
                    message: tokenVerificationResult.errorMessage
                }
            }
            const user = await UserModel().findById(tokenVerificationResult.payload?.userId)
            if (!user) {
                return {
                    status: HttpStatusCodes.BAD_REQUEST,
                    message: "Token is not valid"
                }
            }

            const payload: AuthTokenI = {
                userId: user._id.toString(),
                authorizationRole: user.userRole as AuthorizationRole,
            };

            const accessToken = await JwtController.createToken(
                JwtTokenTypes.AUTH_TOKEN,
                payload,
                USER_JWT_EXPIRY_IN_SECS,
            );

            return {
                status: HttpStatusCodes.OK,
                message: "Token Exchanged",
                data: { accessToken },
            };

        } catch (error) {
            Logger.warn({ message: "Login User Failed", error, tag });

            throw error;
        }
    }
}