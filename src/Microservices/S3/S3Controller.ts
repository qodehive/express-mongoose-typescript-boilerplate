import { S3ImageUploadDto } from "./S3.dto";
import { HttpStatusCodes } from "../../CommonConstants";
import { Logger } from "../../Utils/Logger";
import { ServerConfig } from "../../serverConfig";
import AWS from "aws-sdk";
import sharp from "sharp";
import { v4 as uuid } from "uuid";
const tag = "S3Controller";

const BUCKET_NAME = ServerConfig.S3_CONFIG.bucketName;
// Configure the AWS SDK with your access credentials
AWS.config.update({
  accessKeyId: ServerConfig.S3_CONFIG.secretAccessKey,
  secretAccessKey: ServerConfig.S3_CONFIG.accessKeyId,
  region: ServerConfig.S3_CONFIG.region,
});

// Create an S3 instance
const s3 = new AWS.S3();

export const S3Controller = {
  async upload(input: S3ImageUploadDto) {
    try {
      const { file, folder } = input;
      const base64Image = file.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      const imageBuffer = Buffer.from(base64Image, "base64");
      if (imageBuffer) {
        const regex = /^data:image\/(\w+);base64,/; // Regex pattern to match the image extension
        const match = file.match(regex);
        let extension = "jpg";
        if (match && match[1]) {
          extension = match[1];
        }

        // Create thumbnail using Sharp
        const compressImageBuffer = await sharp(imageBuffer).jpeg({ quality: 95 }).toBuffer();
        const imageName = `${uuid()}.${extension}`;

        const originalUploadParams = {
          Bucket: BUCKET_NAME,
          Key: folder + "/" + imageName,
          Body: compressImageBuffer,
          ContentType: `image/${extension}`,
        };

        const originalUploadResult = await s3.upload(originalUploadParams).promise();

        return {
          status: HttpStatusCodes.OK,
          message: "Url Created for File Upload",
          data: originalUploadResult.Location,
        };
      }
      return {
        status: HttpStatusCodes.BAD_REQUEST,
        message: "Image is not proper",
      };
    } catch (error) {
      Logger.warn({ message: "getSignedUrlForFileUpload Failed", error, tag });
      throw error;
    }
  },
};
