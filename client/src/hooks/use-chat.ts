import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { getSessionId } from "@/lib/session";

interface UseChatOptions {
  conversationId: number;
}

interface SendMessageOptions {
  content: string;
  imageUrl?: string;
}

export function useChat({ conversationId }: UseChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSearching, setIsSearching] = useState<string | null>(null); // search query or null
  const [optimisticUserMessage, setOptimisticUserMessage] = useState<{ content: string; imageUrl?: string } | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sendMessage = useCallback(
    async ({ content, imageUrl }: SendMessageOptions) => {
      if (!content.trim() && !imageUrl) return;
      if (isStreaming) return;

      setIsStreaming(true);
      setIsGeneratingImage(false);
      setIsSearching(null);
      setOptimisticUserMessage({ content, imageUrl });
      setStreamingMessage("");

      try {
        const url = buildUrl(api.conversations.chat.path, { id: conversationId });
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Id": getSessionId(),
          },
          body: JSON.stringify({ content, imageUrl }),
        });

        if (!res.ok) throw new Error("Chat request failed");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";
        let imageGenMode = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.error) throw new Error(data.error);
                if (data.done) break;
                if (data.imageGenerating) {
                  imageGenMode = true;
                  setIsGeneratingImage(true);
                  setStreamingMessage("");
                } else if (data.searching) {
                  // Web search triggered — show indicator
                  setIsSearching(data.searching);
                  setStreamingMessage("");
                } else if (data.content && !imageGenMode) {
                  setIsSearching(null); // clear search indicator once content streams
                  setStreamingMessage((prev) => prev + data.content);
                }
              } catch (e) {
                console.error("Failed to parse SSE line:", line, e);
              }
            }
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        toast({
          title: "Message failed to send",
          description: err instanceof Error ? err.message : "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsStreaming(false);
        setIsGeneratingImage(false);
        setIsSearching(null);
        setOptimisticUserMessage(null);
        setStreamingMessage("");
        queryClient.invalidateQueries({ queryKey: [api.conversations.get.path, conversationId] });
      }
    },
    [conversationId, isStreaming, queryClient, toast]
  );

  return { sendMessage, isStreaming, streamingMessage, isGeneratingImage, isSearching, optimisticUserMessage };
}
