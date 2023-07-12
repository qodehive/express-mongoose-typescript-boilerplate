import express from "express";
import { CustomRequestProperty } from "../CommonConstants";

export const RequestHandler = {
  /**
   * Return the access token from Authorization Headers
   * @param {express.Request} req
   * @returns {string|null}
   */
  getAccessToken(req: express.Request): string | null {
    try {
      const authorizationHeader = req.headers["authorization"] as string;

      if (authorizationHeader && authorizationHeader.split(" ")[0] === "Bearer") {
        return authorizationHeader.trim().split(" ")[1] || null;
      }
    } catch (error) {}

    return null;
  },

  setJwtPayload(req: express.Request, payload: any): void {
    (req as any)[CustomRequestProperty.JWT_TOKEN] = payload;
    (req as any)["userId"] = payload?.userId;
  },

  getJwtPayload(req: express.Request): any | null {
    return (req as any)[CustomRequestProperty.JWT_TOKEN] || null;
  },

  /**
   * Gives basic info of the request
   * @param {express.Request} req
   * @returns
   */
  getRequestInfo(req: express.Request) {
    const info = {
      url: req.url,
      path: req.path,
      query: req.query,
      params: req.params,
      body: req.body,
      accessToken: this.getAccessToken(req),
    };

    return info;
  },
};
