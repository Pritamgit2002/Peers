import { Server } from "@tus/server";
import { S3Store } from "@tus/s3-store";
import { getR2S3ClientConfig } from "../../lib/r2.js";
import {
  buildAttachmentKey,
  decodeUploadIdFromUrl,
  encodeUploadIdForUrl,
} from "../../lib/upload-path.js";

const TUS_PATH = "/files";

export function createTusServer() {
  return new Server({
    path: TUS_PATH,
    datastore: new S3Store({
      s3ClientConfig: getR2S3ClientConfig(),
    }),
    namingFunction(_req, metadata) {
      const conversationId = metadata?.conversation_id ?? "unknown";
      const filename = metadata?.filename ?? "file";

      return buildAttachmentKey(conversationId, filename);
    },
    generateUrl(_req, { proto, host, path, id }) {
      return `${proto}://${host}${path}/${encodeUploadIdForUrl(id)}`;
    },
    getFileIdFromRequest(_req, lastPath?: string) {
      if (!lastPath) {
        return undefined;
      }

      return decodeUploadIdFromUrl(lastPath);
    },
    onUploadFinish(_req, upload) {
      const storagePath = upload.id;

      return Promise.resolve({
        headers: {
          "Upload-Metadata": `storage_path ${Buffer.from(storagePath).toString("base64")}`,
        },
      });
    },
  });
}
