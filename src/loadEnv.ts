import * as dotenv from "dotenv";
import path from "path";

const ENV_FILE_PATH = path.join(__dirname, `/../.env`);

const config: dotenv.DotenvConfigOutput = dotenv.config({
  path: ENV_FILE_PATH,
});

export enum ENV_NAMES {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
  STAGING = "staging",
}

export const APP_ENV = ENV_NAMES.DEVELOPMENT;

if (Object.values(ENV_NAMES).indexOf(APP_ENV) == -1) {
  throw new Error(`Invalid ENV Name :${APP_ENV},valid names are : [${Object.values(ENV_NAMES)}] `);
}

import { Logger } from "./Utils/Logger";

if (config.error) {
  throw new Error(`Failed to Load Env from path : ${ENV_FILE_PATH}`);
}

Logger.info({
  message: `ENV Loaded from path : ${ENV_FILE_PATH}`,
  tag: "LoadEnv",
});
