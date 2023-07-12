import express from "express";
import * as http from "http";
import { Logger } from "../Utils/Logger";
import cors from "cors";
import clsTracer from "cls-rtracer";
import morgan from "morgan";

export class ExpressAppServer {
  private readonly port: number;
  private readonly app: express.Application;
  private server?: http.Server;
  private readonly tag: string;
  private readonly appName: string;
  private pendingApiRequests: number;

  constructor(port: number, appName: string) {
    this.port = port;
    this.appName = appName;
    this.tag = `ExpressAppServer:${appName}:${port}`;
    this.pendingApiRequests = 0;
    this.app = express();
  }

  /**
   * Initialises the Express app server,if not already initialised
   * @returns {Promise<express.Express>} the express app instance
   */
  public async initialize(): Promise<express.Application> {
    return new Promise((resolve, reject) => {
      try {
        //check if app is already initialized
        if (!this.server) {
          this.server = http.createServer(this.app);

          this.server.listen(this.port);

          this.server.on("error", (error: NodeJS.ErrnoException) => {
            // handle specific listen errors with friendly messages
            switch (error.code) {
              case "EADDRINUSE":
                Logger.warn({
                  message: `Port ${this.port} is already in use`,
                  error,
                  tag: this.tag,
                });
              default:
                Logger.warn({
                  message: "Failed to start the server",
                  error,
                  tag: this.tag,
                });
            }
            return reject(error);
          });

          this.server.on("listening", () => {
            Logger.info({
              message: `Server 🌎 Started on http://localhost:${this.port}/`,
              tag: this.tag,
            });

            this.interceptRequests();

            this.app.use(
              cors({
                origin: "*",
              }),
            );

            const morganMessageFormatter: morgan.FormatFn = function (tokens, req, res) {
              const logMessage = {
                method: tokens.method(req, res),
                url: tokens.url(req, res),
                status: tokens.status(req, res),
                responseTime: tokens["response-time"](req, res),
                requestLength: tokens.req(req, res, "content-length"),
                responseLength: tokens.res(req, res, "content-length"),
                ipAddress: tokens["remote-addr"](req, res),
                userAgent: tokens.req(req, res, "user-agent"),
                referrer: tokens.req(req, res, "referrer"),
                deviceIdentifier: tokens.req(req, res, "deviceIdentifier"),
                firebaseToken: tokens.req(req, res, "firebaseToken"),
                userId: (req as any).userId,
              };
              return JSON.stringify(logMessage);
            };

            const requestLogger = morgan(morganMessageFormatter, {
              stream: {
                write: (message) => {
                  Logger.http(JSON.parse(message));
                },
              },
              immediate: true,
            });

            const responseLogger = morgan(morganMessageFormatter, {
              stream: {
                write: (message) => {
                  Logger.http(JSON.parse(message));
                },
              },
            });
            this.app.use(clsTracer.expressMiddleware());
            this.app.use(requestLogger);
            this.app.use(responseLogger);

            this.app.use(express.urlencoded({ extended: true }));
            this.app.use(express.json());

            return resolve(this.app);
          });
        } else {
          return resolve(this.app);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   *
   * Gracefully closes the http server
   * When triggered, this will stop accepting new API requests and then wait for the pending API requests to complete
   *
   * This method should always resolve,even in case of errors
   */
  public closeHttpServer(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        return resolve();
      }

      const start = Date.now();

      Logger.info({
        message: `Closing the server, Found ${this.pendingApiRequests} pending API requests`,
        tag: this.tag,
      });

      this.server.close((error) => {
        const time = Date.now() - start;

        if (error) {
          Logger.warn({
            message: `Closing Http Server Failed after ${time} ms`,
            error,
            tag: this.tag,
          });
        } else {
          Logger.info({
            message: `Successfully closed http Server in ${time} ms`,
            tag: this.tag,
          });
        }
        resolve();
      });
    });
  }

  /**
   * Intercepts the API requests and will keep track of pending API requests
   * @returns
   */
  private interceptRequests() {
    this.app.use((req, res, next) => {
      this.pendingApiRequests++;

      req.on("close", () => {
        this.pendingApiRequests--;
      });

      next();
    });
  }
}
