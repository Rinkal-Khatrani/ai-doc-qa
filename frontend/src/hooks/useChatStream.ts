import { useState, useCallback } from "react";
import type { Message } from "../types";

export function useChatStream(docId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (question: string) => {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Add user message
      setMessages((prev) => [...prev, { role: "user", content: question }]);
      // Add placeholder for assistant
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", streaming: true },
      ]);
      setIsStreaming(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/chat/${docId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question }),
        },
      );

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          if (raw === "[DONE]") continue;

          try {
            const data = JSON.parse(raw);
            if (data.token) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + data.token,
                };
                return updated;
              });
            }
            if (data.done) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  citations: data.citations,
                  streaming: false,
                };
                return updated;
              });
              setIsStreaming(false);
            }
          } catch {
            // Ignore JSON parse errors
          }
        }
      }
    },
    [docId],
  );

  return { messages, sendMessage, isStreaming };
}
