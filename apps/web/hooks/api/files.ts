type TGetFileDownloadParams = {
  message_id: number;
  conversation_id: number;
};

type TGetFileDownloadResponse = {
  url: string;
  filename: string;
  expiresIn: number;
};

const buildFileDownloadUrl = ({
  message_id,
  conversation_id,
}: TGetFileDownloadParams) => {
  const searchParams = new URLSearchParams({
    message_id: String(message_id),
    conversation_id: String(conversation_id),
  });

  return `/backend/api/files/download?${searchParams}`;
};

export const getFileDownloadUrl = async (
  params: TGetFileDownloadParams,
): Promise<TGetFileDownloadResponse> => {
  const response = await fetch(buildFileDownloadUrl(params));

  if (!response.ok) {
    throw new Error("Failed to get download URL");
  }

  return response.json();
};
