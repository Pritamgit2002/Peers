import * as tus from "tus-js-client";

export const TUS_ENDPOINT = "/backend/files";

export type UploadedFile = {
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

export type FileUploadState = {
  status: "uploading" | "complete" | "error";
  progress: number;
  error?: string;
  result?: UploadedFile;
};

export function getFileId(file: File) {
  return `${file.name}-${file.lastModified}-${file.size}`;
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return atob(padded);
}

export function getStorageKeyFromUploadUrl(url: string) {
  const pathname = new URL(url, window.location.origin).pathname;
  const encodedId = pathname.split("/").pop() ?? "";

  if (!encodedId) {
    return "";
  }

  return decodeBase64Url(encodedId);
}

export function createTusUpload(
  file: File,
  conversationId: number,
  handlers: {
    onProgress: (progress: number) => void;
    onSuccess: (result: UploadedFile) => void;
    onError: (error: Error) => void;
  },
) {
  const upload = new tus.Upload(file, {
    endpoint: TUS_ENDPOINT,
    chunkSize: 256 * 1024,
    metadata: {
      conversation_id: String(conversationId),
      filename: file.name,
      filetype: file.type || "application/octet-stream",
    },
    retryDelays: [0, 1000, 3000, 5000],
    removeFingerprintOnSuccess: true,
    onError: handlers.onError,
    onProgress(bytesUploaded, bytesTotal) {
      const progress =
        bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0;
      handlers.onProgress(progress);
    },
    onSuccess() {
      const url = upload.url ?? "";
      const key = getStorageKeyFromUploadUrl(url);

      handlers.onSuccess({
        key,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        url,
      });
    },
  });

  upload.start();
  return upload;
}
