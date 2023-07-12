import * as express from "express";
import { Logger } from "../Utils/Logger";

export interface ApiResponseI {
  status: number;
  message: string;
  data?: any;
  extraErrorData?: any;
}

const tag = "ResponseHandler";

export const ResponseHandler = {
  /**
   * Common method to send the response
   *
   * @param {express.Response} res
   * @param {ApiResponseI} body
   */
  sendResponse: function (res: express.Response, body: ApiResponseI) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.status(body.status);
    res.send(body);
  },

  sendErrorResponse: function (res: express.Response, error: Error) {
    const body: ApiResponseI = {
      status: 500,
      message: error.message,
      extraErrorData: error,
    };

    Logger.warn({ message: "Internal Server Error", tag, error });

    this.sendResponse(res, body);
  },
};
