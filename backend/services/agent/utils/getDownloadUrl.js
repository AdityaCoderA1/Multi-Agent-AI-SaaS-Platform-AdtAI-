import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./s3.js";

export const getDownloadUrl = async (
  fileName,
  expiresIn = 600
) => {
  return await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,

      Key:
        fileName
    }),

    {
      expiresIn
    }
  );

};