import { S3 } from "aws-sdk";
import { ServerConfig } from "../serverConfig";
import { Logger } from "./Logger";

const tag = "S3Util";

type AclS3 =
  | "private"
  | "public-read"
  | "public-read-write"
  | "aws-exec-read"
  | "authenticated-read"
  | "bucket-owner-read"
  | "bucket-owner-full-control";

interface S3Config {
  region: string;
  secretAccessKey: string;
  accessKeyId: string;
  bucketName: string;
}

class S3Util {
  private readonly s3Config: S3Config;
  private s3: S3;
  constructor(config: S3Config) {
    this.s3Config = config;
    this.s3 = new S3({
      signatureVersion: "v4",
      region: this.s3Config.region,
      secretAccessKey: this.s3Config.secretAccessKey,
      accessKeyId: this.s3Config.accessKeyId,
    });
  }

  public getPreSignedPostUrlForFileUploading(
    key: string,
    maxContentLengthInBytes: number,
    expiresInSecs: number,
    acl: string,
  ): { url: string; fields: any } {
    try {
      const params = {
        Bucket: this.s3Config.bucketName,
        Conditions: [
          ["content-length-range", 0, maxContentLengthInBytes],
          // [ "starts-with", "$Content-Type", "text/" ],
        ],
        Fields: {
          key,
          acl,
          // "Content-Type":'text/plain'
        },
        Expires: expiresInSecs,
      };
      const data = this.s3.createPresignedPost(params);
      Logger.info({
        message: "getPreSignedPostUrlForFileUploading SUCCESS",
        data,
        tag,
      });
      return data;
    } catch (error) {
      Logger.warn({
        message: "S3 getPreSignedPostUrlForFileUploading Failed",
        error,
        tag,
      });
      throw error;
    }
  }

  public getSignedUrl(key: string, expiresInSecs: number): string {
    try {
      const url = this.s3.getSignedUrl("getObject", {
        Bucket: this.s3Config.bucketName,
        Key: key,
        Expires: expiresInSecs,
      });
      // Logger.info({
      //   message: "getSignedUrl SUCCESS",
      //   data: { url },
      //   tag,
      // });
      return url;
    } catch (error) {
      Logger.warn({
        message: "S3 getSignedUrl Failed",
        error,
        tag,
      });
      throw error;
    }
  }

  public getCompleteURL(filePath: string): string {
    return `https://${this.s3Config.bucketName}.s3.${this.s3Config.region}.amazonaws.com/${filePath}`;
  }

  public listDir(dirPath: string) {
    try {
      const input: S3.Types.ListObjectsV2Request = {
        Bucket: this.s3Config.bucketName,
        Prefix: dirPath,
      };
      const res = this.s3.listObjectsV2(input).promise();
      return res;
    } catch (error) {
      Logger.warn({
        message: "S3 listDir Failed",
        error,
        tag,
      });
      throw error;
    }
  }
}

export const S3UtilInstance = new S3Util(ServerConfig.S3_CONFIG);
