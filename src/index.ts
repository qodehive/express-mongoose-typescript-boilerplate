import { APP_ENV } from "./loadEnv";
import { MicroServices } from "./Microservices";
import { Logger } from "./Utils/Logger";

const argsList = process.argv;
const commandIndex = 2;
const commandName = argsList[commandIndex];

Logger.info({
  message: `Env: ${APP_ENV} , commandName: ${commandName}`,
  tag: "index",
});

switch (commandName) {
  case "user_service":
    MicroServices.RestApi.main().then();
    break;
  default:
    throw new Error(`Invalid command : ${commandName}`);
}
