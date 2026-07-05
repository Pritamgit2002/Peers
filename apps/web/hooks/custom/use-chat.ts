import { useState } from "react"
import { getIdToken } from "firebase/auth"
import { env } from "@/constants/env"
import { auth } from "@/lib/firebase"
import {
  detect_streaming_artifact,
  parse_sse_buffer,
} from "@/lib/message-parser"
import type { TArtifactSegment } from "@/lib/message-parser"
import type {
  TReasoningPart,
  TTextPart,
  TToolCallPart,
  TToolResultPart,
  TUserContextMessage,
} from "@examhell/types"

type TChatParams = {
  prompt: string
  user_files?: string[]
}

export const useChat = (conversationId: string | undefined) => {
  const [messages, setMessages] = useState<TUserContextMessage[]>([])
  const [streamingMessage, setStreamingMessage] =
    useState<TUserContextMessage | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [streamingTitle, setStreamingTitle] = useState<string | null>(null)
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])

  const toggleSelectedFileId = (fileId: string) => {
    console.log("in [useChat] toggleSelectedFileId", fileId)
    setSelectedFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    )
  }

  const removeSelectedFileId = (fileId: string) => {
    setSelectedFileIds((prev) => prev.filter((id) => id !== fileId))
  }

  const connectSSEandStartStreaming = async ({
    prompt,
    user_files,
  }: TChatParams) => {
    const files = user_files ?? selectedFileIds
    setSelectedFileIds([])
    setIsStreaming(true)
    setStatusText(null)
    setError(null)

    setMessages([
      {
        id: crypto.randomUUID(),
        conversation: conversationId ?? "",
        role: "user",
        content: [{ type: "text", text: prompt }],
        files,
        created_at: new Date(),
        status: "in_progress",
        error: null,
      },
    ])

    setStreamingMessage({
      id: crypto.randomUUID(),
      conversation: conversationId ?? "",
      role: "assistant",
      content: [],
      files: files,
      created_at: new Date(),
      status: "in_progress",
      error: null,
    })

    try {
      const idToken = auth.currentUser
        ? await getIdToken(auth.currentUser)
        : null

      console.log("in [useChat] connectSSEandStartStreaming", {
        prompt,
        user_files: files,
      })

      const response = await fetch(
        `${env.NEXT_PUBLIC_AI_URL}/chats/${conversationId ?? ""}/completion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken && { Authorization: `Bearer ${idToken}` }),
          },
          body: JSON.stringify({
            prompt,
            ...(files.length > 0 && { user_files: files }),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("Response body is not readable")

      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const { events, remaining_buffer } = parse_sse_buffer(buffer)
        buffer = remaining_buffer

        for (const event of events) {
          if (event.type === "complete") {
            return
          }

          if (event.type === "error") {
            throw new Error(event.message)
          }

          if (event.type === "title") {
            setStreamingTitle(event.title)
          }

          if (event.type === "status") {
            setStatusText(event.text)
          }

          if (event.type === "tool-call") {
            const tool_call_part: TToolCallPart = {
              type: "tool-call",
              toolCallId: event.tool_call_id,
              toolName: event.tool_name,
              input: event.tool_args,
              startTime: event.start_time,
            }
            setStreamingMessage((prev) =>
              prev
                ? { ...prev, content: [...prev.content, tool_call_part] }
                : prev
            )
          }

          if (event.type === "tool-result") {
            const tool_result_part: TToolResultPart = {
              type: "tool-result",
              toolCallId: event.tool_call_id,
              toolName: event.tool_name,
              output: event.output,
              startTime: event.start_time,
              endTime: event.end_time,
            }
            setStatusText(null)
            setStreamingMessage((prev) =>
              prev
                ? { ...prev, content: [...prev.content, tool_result_part] }
                : prev
            )
          }

          if (event.type === "thinking-delta") {
            setStreamingMessage((prev) => {
              if (!prev) return prev
              const content = [...prev.content]
              const last = content[content.length - 1]
              if (last?.type === "reasoning") {
                content[content.length - 1] = {
                  type: "reasoning",
                  text: (last as TReasoningPart).text + event.text,
                }
              } else {
                content.push({ type: "reasoning", text: event.text })
              }
              return { ...prev, content }
            })
          }

          if (event.type === "text-delta") {
            setStatusText(null)
            setStreamingMessage((prev) => {
              if (!prev) return prev
              const content = [...prev.content]
              const last = content[content.length - 1]
              if (last?.type === "text") {
                content[content.length - 1] = {
                  type: "text",
                  text: (last as TTextPart).text + event.text,
                }
              } else {
                content.push({ type: "text", text: event.text })
              }
              return { ...prev, content }
            })
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsStreaming(false)
      setStatusText(null)
    }
  }

  const clearMessages = () => {
    setMessages([])
    setStreamingMessage(null)
    setStreamingTitle(null)
  }

  const streaming_text = isStreaming
    ? (streamingMessage?.content ?? [])
        .filter((c) => c.type === "text")
        .map((c) => (c as TTextPart).text)
        .join("")
    : ""

  const streaming_artifact: TArtifactSegment | null = isStreaming
    ? detect_streaming_artifact(streaming_text)
    : null

  return {
    messages,
    streamingMessage,
    isStreaming,
    statusText,
    error,
    streamingTitle,
    streamingArtifact: streaming_artifact,
    clearMessages,
    connectSSEandStartStreaming,
    selectedFileIds,
    toggleSelectedFileId,
    removeSelectedFileId,
  }
}
