import * as express from "express";
import UserRouter from "./User/UserRouter";
import AuthRouter from "./Auth/AuthRouter";

import { S3Router } from "./S3/S3Router";

const ApiRouter = express.Router();
ApiRouter.use("/user", UserRouter);
ApiRouter.use("/auth", AuthRouter);
ApiRouter.use("/s3", S3Router);

export { ApiRouter };
const ap = "safs"
ap.replace("s", "as")