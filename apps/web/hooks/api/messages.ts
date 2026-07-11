import { TMessage } from "@/types/messages";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

type TGetMessagesParams = {
  conversation_id: number;
};

type TGetMessagesResponse = {
  messages: TMessage[];
};

type TPostMessageBody = {
  sender_id: number;
  content?: string;
  attachment_key?: string;
  attachment_type?: string;
};

type TPostMessagePayload = TGetMessagesParams & TPostMessageBody;

type TPostMessageResponse = {
  message: unknown;
};

const buildMessagesUrl = (conversation_id: number) => {
  const searchParams = new URLSearchParams({
    conversation_id: String(conversation_id),
  });

  return `/backend/api/messages?${searchParams}`;
};

const getMessages = async (
  params: TGetMessagesParams,
): Promise<TGetMessagesResponse> => {
  const response = await fetch(buildMessagesUrl(params.conversation_id));

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  return response.json();
};

const postMessage = async ({
  conversation_id,
  ...body
}: TPostMessagePayload): Promise<TPostMessageResponse> => {
  const response = await fetch(buildMessagesUrl(conversation_id), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to post message");
  }

  return response.json();
};

export const usePostMessage = (
  options?: Omit<
    UseMutationOptions<TPostMessageResponse, Error, TPostMessagePayload>,
    "mutationKey" | "mutationFn"
  >,
) => {
  return useMutation({
    mutationKey: ["usePostMessage"],
    mutationFn: postMessage,
    ...options,
  });
};

export const useGetMessages = (
  params: TGetMessagesParams,
  options?: Omit<
    UseQueryOptions<TGetMessagesResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: ["useGetMessages", params.conversation_id],
    queryFn: () => getMessages(params),
    ...options,
  });
};

export const useAppendMessageToCache = (conversationId: number) => {
  const queryClient = useQueryClient();

  return (message: TMessage) => {
    queryClient.setQueryData<TGetMessagesResponse>(
      ["useGetMessages", conversationId],
      (currentData) => {
        if (!currentData) {
          return { messages: [message] };
        }

        const alreadyExists = currentData.messages.some(
          (existingMessage) => existingMessage.id === message.id,
        );

        if (alreadyExists) {
          return currentData;
        }

        return {
          messages: [message, ...currentData.messages],
        };
      },
    );
  };
};
