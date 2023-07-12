import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { AuthorizationRole } from "../CommonConstants";
import { JwtTokenTypes } from "../Security/JwtConfig";
import * as sinon from "sinon";

export const UnitTestHelper = {
  getJwtVerifyResponse: (data: {
    userId?: mongoose.Types.ObjectId;
    authorizationRole?: AuthorizationRole;
  }) => {
    return {
      errCode: 0,
      isVerified: true,
      errorMessage: null,
      payload: {
        userId: data.userId || faker.database.mongodbObjectId(),
        tokenType: JwtTokenTypes.AUTH_TOKEN,
        authorizationRole: data.authorizationRole || AuthorizationRole.ADMIN,
        iat: 0,
        exp: 0,
      },
    };
  },
  mockSave(stub: sinon.SinonStubStatic, model: mongoose.Model<any>) {
    return stub(model.prototype, "save").callsFake(function (this: any) {
      return Promise.resolve({
        ...this._doc,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  },
};
