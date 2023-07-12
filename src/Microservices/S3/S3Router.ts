import * as express from "express";
import { validateDtoMiddleware } from "../../CommonHttpServer/RequestValidator";
import { ResponseHandler } from "../../CommonHttpServer/ResponseHandler";
import { JwtController } from "../../Security/JwtController";
import { JwtTokenTypes } from "../../Security/JwtConfig";
import { S3Controller } from "./S3Controller";
import { s3ImageUploadDto } from "./S3.dto";
const router = express.Router();

router.post(
  "/upload",
  validateDtoMiddleware(s3ImageUploadDto, "body", "zod"),
  JwtController.validateTokenMiddleware(JwtTokenTypes.AUTH_TOKEN),
  async (req: express.Request, res: express.Response) => {
    try {
      const response = await S3Controller.upload(req.body);

      ResponseHandler.sendResponse(res, response);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, error);
    }
  },
);

export { router as S3Router };
