import chai, { expect } from "chai";
import * as sinon from "sinon";
import { faker } from "@faker-js/faker";
import chaiHttp from "chai-http";
import sinonTest from "sinon-test";
import express from "express";
import request from "superagent";

const test = sinonTest(sinon);
chai.use(chaiHttp);
import { AuthorizationRole, UserRole } from "../../CommonConstants";
import { JwtUtils } from "../../Security/JwtUtils";
import { UnitTestHelper } from "../../UnitTestUtils/UnitTestHelper";
import { IUserEntity, UserModel } from "../../Database/Entities/UserEntity";
import { ApiUnitTestUtils } from "../../UnitTestUtils/ApiUnitTestUtil";
import { FakeModels } from "../../UnitTestUtils/FakeModels";
import { PasswordUtil } from "../../Security/PasswordUtil";
import { LoginDto, RegisterDto, UpdatePasswordDto } from './Auth.dto';
import AuthRouter from './AuthRouter';

describe("UserRouter Test", () => {
    let api: ApiUnitTestUtils;
    let app: express.Application;

    let fakeModel: FakeModels;
    let user: IUserEntity;

    before(async () => {
        api = new ApiUnitTestUtils();
        app = await api.getApp(AuthRouter);
        fakeModel = new FakeModels();

        user = fakeModel.user();
    });

    describe("Register User API", () => {
        let body: RegisterDto;
        let request: () => request.SuperAgentRequest;
        before(async () => {
            request = () => chai.request(app).post("/register");
            body = {
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                userRole: UserRole.USER,
            };
        });

        it("Bad Request", async () => {
            api.assertBadRequest(await request().send({}));
            api.assertBadRequest(
                await chai
                    .request(app)
                    .post("/register")
                    .send({ ...body, emailId: "Invalid EmailId" })
            );
        });

        it("Bad Request", async () => {
            api.assertNotAuthorized(await request().send(body));
        });

        it(
            "Access Forbidden",
            test(async function (this: sinon.SinonStatic) {
                const verifyToken = this.stub(JwtUtils, "verifyJWTToken").resolves(
                    UnitTestHelper.getJwtVerifyResponse({
                        authorizationRole: AuthorizationRole.USER,
                    })
                );
                const response = await request().send(body);
                api.assertForbidden(response, verifyToken);
            })
        );

        it(
            "Email Already Exists",
            test(async function (this: sinon.SinonStatic) {
                const verifyToken = this.stub(JwtUtils, "verifyJWTToken").resolves(
                    UnitTestHelper.getJwtVerifyResponse({})
                );

                const findOne = this.stub(UserModel(), "findOne").resolves(user);

                const response = await request().send(body);
                expect(response.body.message).to.equal(
                    "User with this email already exists"
                );
                expect(response.status).to.equal(400);
                expect(sinon.assert.calledOnce(findOne));
                expect(sinon.assert.calledOnce(verifyToken));
            })
        );

        it(
            "User Registered",
            test(async function (this: sinon.SinonStatic) {
                const verifyToken = this.stub(JwtUtils, "verifyJWTToken").resolves(
                    UnitTestHelper.getJwtVerifyResponse({})
                );

                const userFindOne = this.stub(UserModel(), "findOne").resolves(null);
                const userSave = UnitTestHelper.mockSave(this.stub, UserModel());
                const response = await request().send(body);
                expect(sinon.assert.calledOnce(userFindOne));
                expect(sinon.assert.calledOnce(userSave));
                expect(sinon.assert.calledOnce(verifyToken));

                api.assertSuccessResponse(response);
            })
        );
    });

    describe("Login User API", () => {
        let body: LoginDto;
        let request: () => request.SuperAgentRequest;
        before(async () => {
            request = () => chai.request(app).post("/login");
            body = {
                emailId: user.emailId,
                password: faker.internet.password(),
            };
        });

        it("Bad Request", async () => {
            api.assertBadRequest(await request().send({}));
            api.assertBadRequest(await request().send({ ...body, emailId: null }));
            api.assertBadRequest(await request().send({ ...body, emailId: "" }));
            api.assertBadRequest(await request().send({ ...body, password: "" }));
        });

        it(
            "This User Does Not Exists",
            test(async function (this: sinon.SinonStatic) {
                const findOne = this.stub(UserModel(), "findOne").resolves(null);
                const response = await request().send(body);
                expect(response.body.message).to.equal("This user doesn't exist");
                expect(response.status).to.equal(400);
                expect(sinon.assert.calledOnce(findOne));
            })
        );

        it(
            "Incorrect Password",
            test(async function (this: sinon.SinonStatic) {
                const userFindOne = this.stub(UserModel(), "findOne").resolves(user);

                const checkHash = this.stub(PasswordUtil, "checkHash").resolves(false);

                const response = await request().send(body);
                expect(response.body.message).to.equal("Please check your password.");
                expect(response.status).to.equal(400);
                expect(sinon.assert.calledOnce(userFindOne));
                expect(sinon.assert.calledOnce(checkHash));
            })
        );

        it(
            "Success Login",
            test(async function (this: sinon.SinonStatic) {
                const userFindOne = this.stub(UserModel(), "findOne").resolves(user);

                const checkHash = this.stub(PasswordUtil, "checkHash").resolves(true);
                const response = await request().send(body);
                api.assertSuccessResponse(response);

                expect(response.body.data.user.id).to.equal(user._id.toString());
                expect(response.body.data.refreshToken).to.be.a("string");
                // const payload = JwtUtils.decodeJWTToken(response.body.data.accessToken);
                // expect(payload.userId).to.equal(user._id.toString());
                // expect(payload.userId).to.be.a("string");
                // expect(payload.sessionId).to.be.a("string");

                expect(sinon.assert.calledOnce(userFindOne));
                expect(sinon.assert.calledOnce(checkHash));
            })
        );
    });

    describe("Change Password", () => {
        let request: () => request.SuperAgentRequest;
        let body: UpdatePasswordDto;
        before(async () => {
            request = () => chai.request(app).put("/update-password");
            body = {
                newPassword: faker.internet.password(),
            };
        });

        it("Bad Request", async () => {
            api.assertBadRequest(
                await request().send({ ...body, newPassword: null })
            );
        });

        it("Not Authorized", async () => {
            api.assertNotAuthorized(await request().send(body));
        });

        it(
            "Invalid UserId",
            test(async function (this: sinon.SinonStatic) {
                const verifyToken = this.stub(JwtUtils, "verifyJWTToken").resolves(
                    UnitTestHelper.getJwtVerifyResponse({
                        authorizationRole: AuthorizationRole.USER,
                    })
                );
                const findOneUser = this.stub(UserModel(), "findOne").resolves(null);

                const response = await request().send(body);
                expect(response.status).to.equal(404);
                expect(sinon.assert.calledOnce(verifyToken));
                expect(sinon.assert.calledOnce(findOneUser));
            })
        );

        it(
            "Password Changed",
            test(async function (this: sinon.SinonStatic) {
                const verifyToken = this.stub(JwtUtils, "verifyJWTToken").resolves(
                    UnitTestHelper.getJwtVerifyResponse({
                        authorizationRole: AuthorizationRole.USER,
                    })
                );
                const findOneUser = this.stub(UserModel(), "findOne").resolves(user);
                const userSave = UnitTestHelper.mockSave(this.stub, UserModel());

                const response = await request().send(body);

                api.assertSuccessResponse(response);

                expect(sinon.assert.calledOnce(verifyToken));
                expect(sinon.assert.calledOnce(findOneUser));
                expect(sinon.assert.calledOnce(userSave));
            })
        );
    });

    after(async () => {
        await api.after();
    });
});