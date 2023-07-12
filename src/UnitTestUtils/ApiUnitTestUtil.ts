import express from "express";
import * as sinon from "sinon";
import { ExpressAppServer } from "../CommonHttpServer/ExpressAppServer";
import { MongoDbConnections } from "../Database/MongoDbConnections";
import { Logger } from "../Utils/Logger";
import mongoose from "mongoose";
import { expect } from "chai";
import { UnitTestHelper } from "./UnitTestHelper";
import { AuthorizationRole } from "../CommonConstants";
import { JwtUtils } from "../Security/JwtUtils";

export class ApiUnitTestUtils {
  public expressAppServer: ExpressAppServer;

  public mongooseConnectionStub: sinon.SinonStub;
  public loggerInfoStub: sinon.SinonStub;
  public loggerWarnStub: sinon.SinonStub;
  public loggerHttpStub: sinon.SinonStub;

  constructor() {
    this.mongooseConnectionStub = sinon
      .stub(MongoDbConnections.QodehiveApps, "getConnection")
      .returns(mongoose as any);
    this.loggerInfoStub = sinon.stub(Logger, "info");
    this.loggerWarnStub = sinon.stub(Logger, "warn");
    this.loggerHttpStub = sinon.stub(Logger, "http");
    this.expressAppServer = new ExpressAppServer(0, "love_works_REST_app");
  }

  public before() {
    return true;
  }

  public async getApp(router: express.Router) {
    const app: express.Application = await this.expressAppServer.initialize();
    app.use("/", router);
    return app;
  }

  public async after() {
    this.mongooseConnectionStub.restore();
    await this.expressAppServer.closeHttpServer();

    this.loggerInfoStub.restore();
    this.loggerWarnStub.restore();
    this.loggerHttpStub.restore();
  }

  assertSuccessResponse(response: any) {
    expect(response.body).to.have.property("message");
    expect(response.body).to.have.property("data");

    expect(response.body.message).to.be.a("string");
    expect(response.body.data).to.be.a("object");
    expect(response.status).to.equal(200);
  }

  assertInternalServerResponse(response: any) {
    expect(response.status).to.equal(500);
  }

  assertBadRequest(response: any) {
    expect(response.body.message).to.equal("Bad Request");
    expect(response.status).to.equal(400);
  }

  assertNotAuthorized(response: any) {
    expect(response.body.message).to.equal("Not Authorized");
    expect(response.status).to.equal(401);
  }

  assertForbidden(response: any, verifyTokenSpy: sinon.SinonStub) {
    expect(response.body.message).to.equal("Access Forbidden");
    expect(response.status).to.equal(403);
    expect(sinon.assert.calledOnce(verifyTokenSpy));
  }

  getVerifyTokenStub(
    stubContext: sinon.SinonStubStatic,
    data: {
      userId?: mongoose.Types.ObjectId;
      authorizationRole?: AuthorizationRole;
    },
  ) {
    const verifyToken = stubContext(JwtUtils, "verifyJWTToken").resolves(
      UnitTestHelper.getJwtVerifyResponse(data),
    );

    return verifyToken;
  }
}
