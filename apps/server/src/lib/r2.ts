import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import type { Readable } from "node:stream";

const DOWNLOAD_URL_EXPIRES_IN_SECONDS = 60 * 15;

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

type S3MiddlewareClient = Pick<S3Client, "middlewareStack" | "send">;

function isReadableBody(body: unknown): body is Readable {
  return (
    body != null &&
    typeof body === "object" &&
    typeof (body as Readable).pipe === "function"
  );
}

async function readableToBuffer(body: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

/**
 * @tus/s3-store uploads parts via fs.createReadStream without ContentLength.
 * Streaming SigV4 + checksums break against Cloudflare R2 under Bun, producing
 * "non-retryable streaming request" / SignatureDoesNotMatch. Buffer first.
 */
export function bufferS3UploadBodies(client: S3MiddlewareClient) {
  client.middlewareStack.add(
    (next) => async (args) => {
      const input = args.input as {
        Body?: unknown;
        ContentLength?: number;
      };

      if (isReadableBody(input.Body)) {
        const buffer = await readableToBuffer(input.Body);
        input.Body = buffer;
        input.ContentLength = buffer.length;
      }

      return next(args);
    },
    {
      step: "initialize",
      name: "bufferR2UploadBodies",
      priority: "high",
    },
  );
}

export function getR2S3ClientConfig(): S3ClientConfig & { bucket: string } {
  return {
    bucket: getR2BucketName(),
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
    // Bun's fetch handler breaks SigV4 signing for streaming S3 uploads to R2.
    requestHandler: new NodeHttpHandler(),
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  };
}

let r2Client: S3Client | undefined;

export function getR2Client() {
  if (!r2Client) {
    r2Client = new S3Client(getR2S3ClientConfig());
    bufferS3UploadBodies(r2Client);
  }

  return r2Client;
}

export async function assertR2ObjectExists(key: string) {
  const config = getR2S3ClientConfig();

  await getR2Client().send(
    new HeadObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}

function sanitizeDownloadFilename(filename: string) {
  const trimmed = filename.trim() || "download";

  return trimmed.replace(/["\r\n]/g, "_");
}

export async function getR2DownloadUrl(key: string, filename: string) {
  const config = getR2S3ClientConfig();
  const safeFilename = sanitizeDownloadFilename(filename);

  const url = await getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${safeFilename}"`,
    }),
    { expiresIn: DOWNLOAD_URL_EXPIRES_IN_SECONDS },
  );

  return {
    url,
    filename: safeFilename,
    expiresIn: DOWNLOAD_URL_EXPIRES_IN_SECONDS,
  };
}
