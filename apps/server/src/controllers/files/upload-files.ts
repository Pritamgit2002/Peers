import { Server } from "@tus/server";
import { S3Store } from "@tus/s3-store";
import {
  assertR2ObjectExists,
  bufferS3UploadBodies,
  getR2S3ClientConfig,
} from "../../lib/r2.js";
import { db } from "../../db/index.js";
import { MESSAGE_TYPE, messages } from "../../db/schema.js";
import { broadcastMessageCreated } from "../../websocket/broadcaster.js";
import {
  buildAttachmentKey,
  decodeUploadIdFromUrl,
  encodeUploadIdForUrl,
} from "../../lib/upload-path.js";

const TUS_PATH = "/files";

/** Next.js rewrites /backend/* to the API; keep TUS chunk URLs on that path. */
const TUS_PUBLIC_PREFIX = process.env.TUS_PUBLIC_PREFIX ?? "/backend";

/** S3 min part size; keep TUS client chunks aligned so incomplete parts are rare. */
export const TUS_PART_SIZE = 5 * 1024 * 1024;

class R2S3Store extends S3Store {
  constructor(options: ConstructorParameters<typeof S3Store>[0]) {
    super(options);
    bufferS3UploadBodies(this.client);
  }
}

export function createTusServer() {
  return new Server({
    path: TUS_PATH,
    datastore: new R2S3Store({
      partSize: TUS_PART_SIZE,
      minPartSize: TUS_PART_SIZE,
      useTags: false,
      s3ClientConfig: getR2S3ClientConfig(),
    }),
    namingFunction(_req, metadata) {
      const conversationId = metadata?.conversation_id ?? "unknown";
      const filename = metadata?.filename ?? "file";

      return buildAttachmentKey(conversationId, filename);
    },
    generateUrl(_req, { proto, host, path, id }) {
      const encodedId = encodeUploadIdForUrl(id);

      if (TUS_PUBLIC_PREFIX) {
        return `${TUS_PUBLIC_PREFIX}${path}/${encodedId}`;
      }

      return `${proto}://${host}${path}/${encodedId}`;
    },
    getFileIdFromRequest(_req, lastPath?: string) {
      if (!lastPath) {
        return undefined;
      }

      return decodeUploadIdFromUrl(lastPath);
    },
    async onUploadFinish(_req, upload) {
      const storagePath = upload.id;
      const metadata = upload.metadata ?? {};
      const conversationId = Number(metadata.conversation_id);
      const senderId = Number(metadata.sender_id);
      const filename = metadata.filename ?? "";

      if (!conversationId || !senderId) {
        throw {
          status_code: 400,
          body: "Missing conversation_id or sender_id in upload metadata",
        };
      }

      try {
        await assertR2ObjectExists(storagePath);
      } catch (error) {
        console.error(
          `[tus] upload finished in TUS but object missing in R2: ${storagePath}`,
          error,
        );
        throw {
          status_code: 500,
          body: "Upload failed to persist to storage",
        };
      }

      const [message] = await db
        .insert(messages)
        .values({
          conversationId,
          senderId,
          type: MESSAGE_TYPE.FILE,
          content: filename,
          attachmentKey: storagePath,
          attachmentType: "file",
        })
        .returning();

      if (message) {
        broadcastMessageCreated(message);
      }

      return {
        headers: {
          "Upload-Metadata": `storage_path ${Buffer.from(storagePath).toString("base64")}`,
        },
      };
    },
    async onResponseError(_req, err) {
      console.error("[tus] upload error:", err);
      return undefined;
    },
  });
}
