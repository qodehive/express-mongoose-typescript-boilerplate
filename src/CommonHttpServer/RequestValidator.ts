import * as express from "express";
import { ResponseHandler } from "./ResponseHandler";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { RequestHandler } from "./RequestHandler";
import { Logger } from "../Utils/Logger";
import { HttpStatusCodes } from "../CommonConstants";
import { ZodSchema } from "zod";

const tag = "RequestValidator";

const validateUsingClassValidator = async (dto: any, input: any) => {
  console.log(dto)
  const obj: any = plainToClass(dto, input);
  const validationErrors = await validate(obj, {});
  const isFailed = validationErrors.length > 0;

  return { obj, isFailed, validationErrors };
};

const validateUsingZodSchema = (dto: ZodSchema, input: any) => {
  const parseRes = dto.safeParse(input);

  if (parseRes.success) {
    return { obj: parseRes.data, isFailed: false, validationErrors: [] };
  }

  return { obj: {}, isFailed: true, validationErrors: parseRes.error.issues };
};

/**
 *
 * Middleware for request validation and transformation (if any)
 *
 * @param {Class} dto  - Class for which validation will be performed
 * @param {'body'|'query'|'params'} propertyToValidate which property of request is to be validated
 */
export const validateDtoMiddleware = function (
  dto: any,
  propertyToValidate: "body" | "query" | "params",
  using: "class-validator" | "zod" = "class-validator",
) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let input: any = {};
    switch (propertyToValidate) {
      case "body":
        input = req.body;
        break;
      case "query":
        input = req.query;
        break;
      case "params":
        input = req.params;
        break;
    }

    let isFailed = false;
    let obj: any = {};
    let validationErrors: any = [];

    if (using === "class-validator") {
      const response = await validateUsingClassValidator(dto, input);

      obj = response.obj;
      isFailed = response.isFailed;
      validationErrors = response.validationErrors;
    } else {
      const response = validateUsingZodSchema(dto, input);

      obj = response.obj;
      isFailed = response.isFailed;
      validationErrors = response.validationErrors;
    }

    Logger.info({ message: "Request Input", data: { obj }, tag });
    if (isFailed) {
      const requestInfo = RequestHandler.getRequestInfo(req);

      Logger.warn({
        message: "Request Validation Failed",
        error: { requestInfo, validationErrors },
        tag,
      });

      ResponseHandler.sendResponse(res, {
        message: "Bad Request",
        data: validationErrors,
        status: HttpStatusCodes.BAD_REQUEST,
      });
    } else {
      switch (propertyToValidate) {
        case "body":
          req.body = obj;
          break;
        case "query":
          req.query = obj;
          break;
        case "params":
          req.params = obj;
          break;
      }
      next();
    }
  };
};
