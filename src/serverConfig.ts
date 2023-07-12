export const ServerConfig = {
  REST_API_PORT: parseInt(process.env.REST_API_PORT || "3005"),

  MONGO_CONFIG: {
    connectionUrl: process.env.MONGO_CONNECTION_URL as string,
  },
  JWT_CONFIG: {
    JWT_SECRET: process.env.JWT_SECRET || "Jwt secret for boilerplate",
    AUTH_PUBLIC_BASE64: process.env.AUTH_PUBLIC_BASE64 || "",
    AUTH_PRIVATE_BASE64: process.env.AUTH_PRIVATE_BASE64 || "",
  },
  S3_CONFIG: {
    region: process.env.S3_REGION as string,
    secretAccessKey: process.env.S3_ACCESS_KEY as string,
    accessKeyId: process.env.S3_ACCESS_ID as string,
    bucketName: process.env.S3_BUCKET_NAME as string,
  },
};
