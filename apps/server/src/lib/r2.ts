import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getR2BucketName() {
  return requireEnv("R2_BUCKET_NAME");
}

export function getR2S3ClientConfig(): S3ClientConfig & { bucket: string } {
  return {
    bucket: getR2BucketName(),
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
    // Bun's fetch handler breaks SigV4 signing for streaming S3 uploads to R2.
    requestHandler: new NodeHttpHandler(),
    requestStreamBufferSize: 8 * 1024 * 1024,
  };
}

export const r2 = new S3Client(getR2S3ClientConfig());
