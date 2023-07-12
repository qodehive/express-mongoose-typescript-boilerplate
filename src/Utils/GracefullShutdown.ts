import { ExpressAppServer } from "../CommonHttpServer/ExpressAppServer";
import { MongoDbConnection } from "../Database/MongoDbConnections";
import { Logger } from "./Logger";

export class GraceFullShutDown {
  private readonly name: string;
  private readonly tag: string;
  private readonly expressAppServerList: ExpressAppServer[];
  private readonly dbConnectionList: MongoDbConnection[];
  private readonly prePromisesList: (() => Promise<any>)[];
  private readonly postPromisesList: (() => Promise<any>)[];

  private isShuttingDown = false;
  private readonly TIMEOUT_IN_MILLIS = 30000; //30 secs

  constructor(name: string) {
    this.name = name;
    this.tag = `GraceFullShutDown:${name}`;
    this.expressAppServerList = [];
    this.dbConnectionList = [];
    this.prePromisesList = [];
    this.postPromisesList = [];
    this.isShuttingDown = false;
  }

  public listen() {
    process.on("SIGINT", () => {
      Logger.info({
        message: "Received SIGINT signal from terminal (Ctrl+C)",
        tag: this.tag,
      });
      this.shutDown("From SIGINT signal");
    });

    process.on("SIGTERM", () => {
      Logger.info({
        message: "Received SIGTERM signal to terminate the application gracefully",
        tag: this.tag,
      });
      this.shutDown("From SIGTERM signal");
    });

    process.on("exit", (code) => {
      Logger.info({
        message: `Application Closed with code:${code}`,
        tag: this.tag,
      });
    });

    process.on("uncaughtException", (error) => {
      Logger.warn({
        message: "uncaughtException Found,Closing the app",
        error: { error, stack: error.stack },
        tag: this.tag,
      });
      this.shutDown("From uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      Logger.warn({
        message: "unhandledRejection Found",
        error: { reason, promise },
        tag: this.tag,
      });
    });
  }

  private async shutDown(reason: string) {
    try {
      if (this.isShuttingDown) {
        return;
      }
      this.isShuttingDown = true;

      Logger.info({
        message: `GraceFull Shutdown Started`,
        data: { reason },
        tag: this.tag,
      });

      setTimeout(() => {
        Logger.warn({
          message: `GraceFull Shutdown TIMEOUT ERROR :${this.TIMEOUT_IN_MILLIS} ms`,
          error: { reason },
          tag: this.tag,
        });
        process.exit(10);
      }, this.TIMEOUT_IN_MILLIS);

      Logger.info({
        message: `Found ${this.prePromisesList.length} prepromises to resolve`,
        tag: this.tag,
      });

      for (const promise of this.prePromisesList) {
        await promise();
      }

      Logger.info({
        message: `Found ${this.expressAppServerList.length} expressApp server to close`,
        tag: this.tag,
      });

      for (const server of this.expressAppServerList) {
        await server.closeHttpServer();
      }

      Logger.info({
        message: `Found ${this.dbConnectionList.length} db connections to close`,
        tag: this.tag,
      });

      for (const dbConnection of this.dbConnectionList) {
        await dbConnection.closeConnection();
      }

      Logger.info({
        message: `Found ${this.postPromisesList.length} postPromises to resolve`,
        tag: this.tag,
      });

      for (const promise of this.postPromisesList) {
        await promise();
      }

      Logger.info({
        message: `GraceFull Shutdown Success`,
        data: { reason },
        tag: this.tag,
      });
      process.exit(0);
    } catch (error) {
      Logger.warn({
        message: `GraceFull Shutdown ERROR`,
        error: { error, reason },
        tag: this.tag,
      });
      process.exit(1);
    }
  }

  public registerHttpServer(server: ExpressAppServer) {
    this.expressAppServerList.push(server);
  }

  public registerDbConnection(dbConnection: MongoDbConnection) {
    this.dbConnectionList.push(dbConnection);
  }

  public registerPrePromise(promise: () => Promise<any>) {
    this.prePromisesList.push(promise);
  }

  public registerPostPromise(promise: () => Promise<any>) {
    this.postPromisesList.push(promise);
  }
}
