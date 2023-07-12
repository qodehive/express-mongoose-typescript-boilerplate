import * as express from "express";
import { validateDtoMiddleware } from "../../CommonHttpServer/RequestValidator";
import { ResponseHandler } from "../../CommonHttpServer/ResponseHandler";
import { JwtController } from "../../Security/JwtController";
import { JwtTokenTypes } from "../../Security/JwtConfig";
import { AuthorizationRole } from "../../CommonConstants";
import {
  CreateXXXXXDto,
  GetXXXXXByIdDto,
  UpdateXXXXXDto,
  createXXXXXDto,
  deleteManyXXXXXDto,
  deleteXXXXXDto,
  getXXXXXByIdDto,
  updateXXXXXDto,
} from "./XXXXX.dto";
import { XXXXXController } from "./XXXXXController";

const router = express.Router();
router.use(express.json());

router.get(
  "/",
  JwtController.validateTokenMiddleware(JwtTokenTypes.AUTH_TOKEN, [AuthorizationRole.ADMIN]),
  async (req: express.Request, res: express.Response) => {
    try {
      const response = await XXXXXController.index();
      ResponseHandler.sendResponse(res, response);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, error);
    }
  },
);

router.get(
  "/:entityId",
  validateDtoMiddleware(getXXXXXByIdDto, "params", "zod"),
  JwtController.validateTokenMiddleware(JwtTokenTypes.AUTH_TOKEN, [AuthorizationRole.ADMIN]),
  async (req: express.Request, res: express.Response) => {
    try {
      const response = await XXXXXController.getEntityById(
        (req.params as any as GetXXXXXByIdDto).entityId,
      );
      ResponseHandler.sendResponse(res, response);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, error);
    }
  },
);

router.post(
  "/create",
  validateDtoMiddleware(createXXXXXDto, "body", "zod"),
  JwtController.validateTokenMiddleware(JwtTokenTypes.AUTH_TOKEN, [AuthorizationRole.ADMIN]),
  async (req: express.Request, res: express.Response) => {
    try {
      const response = await XXXXXController.create(req.body as CreateXXXXXDto);
      ResponseHandler.sendResponse(res, response);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, error);
    }
  },
);

router.patch(
  "/",
  validateDtoMiddleware(updateXXXXXDto, "body", "zod"),
  JwtController.validateTokenMiddleware(JwtTokenTypes.AUTH_TOKEN, [AuthorizationRole.ADMIN]),
  async (req: express.Request, res: express.Response) => {
    try {
      const response = await XXXXXController.update(req.body as UpdateXXXXXDto);
      ResponseHandler.sendResponse(res, response);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, error);
    }
  },
);

router.delete(
  "/:id",
  validateDtoMiddleware(deleteXXXXXDto, "params", "zod"),
  JwtController.validateTokenMiddleware(JwtTokenTypes.AUTH_TOKEN, [AuthorizationRole.ADMIN]),
  async (req: express.Request, res: express.Response) => {
    try {
      const response = await XXXXXController.destroy(req.params as any);
      ResponseHandler.sendResponse(res, response);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, error);
    }
  },
);

router.post(
  "/delete",
  validateDtoMiddleware(deleteManyXXXXXDto, "body", "zod"),
  JwtController.validateTokenMiddleware(JwtTokenTypes.AUTH_TOKEN, [AuthorizationRole.ADMIN]),
  async (req: express.Request, res: express.Response) => {
    try {
      const response = await XXXXXController.destroyMany(req.body as any);
      ResponseHandler.sendResponse(res, response);
    } catch (error) {
      ResponseHandler.sendErrorResponse(res, error);
    }
  },
);
export { router as XXXXXRouter };
