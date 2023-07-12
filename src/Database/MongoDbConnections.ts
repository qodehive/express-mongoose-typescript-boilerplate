import mongoose from "mongoose";
import { ServerConfig } from "../serverConfig";
import { Logger } from "../Utils/Logger";

export interface MongoDbConfig {
  connectionUrl: string;
}

export class MongoDbConnection {
  private readonly connectionUrl: string;
  private connection?: mongoose.Connection;
  private name: string;
  private readonly tag: string;

  constructor(config: MongoDbConfig, name: string) {
    this.name = name;
    this.connectionUrl = config.connectionUrl;
    this.tag = `MongoDbConnection:${name}`;
  }

  public createConnection(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.connection) {
        resolve();
      } else {
        Logger.info({
          message: "Connecting to Mongodb",
          data: { connection: this.connectionUrl },
          tag: this.tag,
        });
        this.connection = mongoose.createConnection(this.connectionUrl, {});

        this.connection.on("error", (err: any) => {
          Logger.warn({
            message: "Mongo Error Occured",
            error: { err, connection: this.connectionUrl },
            tag: this.tag,
          });
          reject(err);
        });

        this.connection.on("open", () => {
          Logger.info({
            message: "Mongo Connect done",
            data: { connection: this.connectionUrl },
            tag: this.tag,
          });
          resolve();
        });
      }
    });
  }

  public getConnection() {
    if (this.connection) {
      return this.connection;
    }
    throw new Error(`MongoDbConnection is not created:${this.tag}`);
  }

  /**
   * Closes the database connection Gracefully
   * @returns
   */
  public async closeConnection() {
    if (this.connection) {
      await this.connection.close();
    }
  }
}

export const MongoDbConnections = {
  QodehiveApps: new MongoDbConnection(ServerConfig.MONGO_CONFIG, "test_db_app"),
};
