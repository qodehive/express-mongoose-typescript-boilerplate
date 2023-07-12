import { z } from "zod";

export const s3ImageUploadDto = z.object({
  file: z.string().nonempty(),
  folder: z.string().nonempty(),
});

export const s3ImageUploadResponse = z.object({
  url: z.string().nonempty(),
});

export type S3ImageUploadDto = z.infer<typeof s3ImageUploadDto>;
