import express from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI, { toFile } from "openai";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function getSessionId(req: any): string {
  return (req.headers["x-session-id"] as string) || "anonymous";
}

export async function registerRoutes(
  httpServer: Server,
  app: express.Express
): Promise<Server> {
  registerObjectStorageRoutes(app);

  // Voice note transcription via OpenAI Whisper
  app.post("/api/transcribe",
    express.raw({ type: "*/*", limit: "25mb" }),
    async (req, res) => {
      try {
        const buffer = req.body as Buffer;
        if (!buffer || buffer.length < 100) {
          return res.status(400).json({ message: "Audio too short or empty" });
        }
        const contentType = (req.headers["content-type"] as string) || "audio/webm";
        const ext = contentType.includes("ogg") ? "ogg"
          : contentType.includes("mp4") || contentType.includes("m4a") ? "mp4"
          : "webm";
        const audioFile = await toFile(buffer, `recording.${ext}`, { type: contentType });
        const result = await openai.audio.transcriptions.create({
          file: audioFile,
          model: "whisper-1",
        });
        res.json({ text: result.text });
      } catch (err: any) {
        console.error("Transcription error:", err?.message);
        res.status(500).json({ message: "Transcription failed. Please try again." });
      }
    }
  );

  app.get(api.conversations.list.path, async (req, res) => {
    const sessionId = getSessionId(req);
    const data = await storage.getConversations(sessionId);
    res.json(data);
  });

  app.get(api.conversations.get.path, async (req, res) => {
    const sessionId = getSessionId(req);
    const id = Number(req.params.id);
    const conversation = await storage.getConversation(id, sessionId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    const msgs = await storage.getMessagesByConversation(id);
    res.json({ ...conversation, messages: msgs });
  });

  app.post(api.conversations.create.path, async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const input = api.conversations.create.input.parse(req.body);
      const conversation = await storage.createConversation({ ...input, sessionId });
      res.status(201).json(conversation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.patch(api.conversations.update.path, async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const id = Number(req.params.id);
      const input = api.conversations.update.input.parse(req.body);
      const conversation = await storage.updateConversation(id, sessionId, input);
      res.status(200).json(conversation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.delete(api.conversations.delete.path, async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      await storage.deleteConversation(Number(req.params.id), sessionId);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.post(api.conversations.chat.path, async (req, res) => {
    const sessionId = getSessionId(req);
    const conversationId = Number(req.params.id);
    const { content, imageUrl } = req.body;

    if (!content && !imageUrl) {
      return res.status(400).json({ message: "Content or imageUrl is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const conversation = await storage.getConversation(conversationId, sessionId);
      if (!conversation) {
        res.write(`data: ${JSON.stringify({ error: "Conversation not found" })}\n\n`);
        res.end();
        return;
      }

      await storage.createMessage({
        conversationId,
        role: "user",
        content: content || "",
        imageUrl: imageUrl || null,
      });

      // Detect image generation requests directly — don't rely on GPT to use a special prefix
      const imageRequestPattern = /\b(draw|paint|generate|create|make|sketch|produce|show|give\s+me|render)\b[\s\w,]*(image|picture|photo|art|illustration|painting|artwork|portrait|scene|wallpaper)\b|\b(image|picture|photo)\b[\s\w]*(of|showing|with|about)\b/i;
      const isImageRequest = imageRequestPattern.test(content || "");

      if (isImageRequest) {
        // Signal client immediately
        res.write(`data: ${JSON.stringify({ imageGenerating: true })}\n\n`);

        // Use a focused GPT call just to get a great image prompt
        const promptResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert at writing image generation prompts. Convert the user request into a rich, detailed, descriptive prompt for an AI image generator. Output ONLY the prompt text, nothing else. No explanations, no quotes, just the prompt."
            },
            { role: "user", content: content || "a beautiful scene" }
          ],
          max_tokens: 250,
          stream: false,
        });

        const imagePrompt = promptResponse.choices[0]?.message?.content?.trim() || content || "beautiful scene";
        const seed = Math.floor(Math.random() * 1000000);
        const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`;

        await storage.createMessage({
          conversationId,
          role: "assistant",
          content: "🎨 Here's your generated image!",
          imageUrl: generatedImageUrl,
          videoUrl: null,
        });

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }

      // Normal chat — stream GPT response
      const history = await storage.getMessagesByConversation(conversationId);

      // Build base URL so we can resolve object-storage image paths for vision
      const protocol = req.headers["x-forwarded-proto"] || "http";
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const baseUrl = `${protocol}://${host}`;

      function buildMessageContent(text: string, imgPath: string | null | undefined): any {
        if (!imgPath) return text;
        const resolvedUrl = imgPath.startsWith("http") ? imgPath : `${baseUrl}${imgPath}`;
        return [
          { type: "text", text: text || "Please describe this image." },
          { type: "image_url", image_url: { url: resolvedUrl, detail: "high" } },
        ];
      }

      // Real-time web search: Google News RSS + DuckDuckGo (both free, no API key)
      async function webSearch(query: string): Promise<string> {
        const parts: string[] = [];

        // 1. Google News RSS — best for live sports, news, current events
        try {
          const newsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
          const newsRes = await fetch(newsUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; ShulAI/1.0; +https://shulai.replit.app)" },
            signal: AbortSignal.timeout(6000),
          });
          if (newsRes.ok) {
            const xml = await newsRes.text();
            // Skip first 2 entries: feed title + channel name, get articles 3–9
            const allTitles = [...xml.matchAll(/<title>(.+?)<\/title>/gs)]
              .map(m => m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<!\[CDATA\[(.+?)\]\]>/s, "$1").trim())
              .filter(t => t.length > 10 && !t.includes("Google News") && !t.startsWith('"'))
              .slice(0, 7);

            const pubDates = [...xml.matchAll(/<pubDate>(.+?)<\/pubDate>/g)].map(m => m[1]);

            if (allTitles.length > 0) {
              parts.push(`📰 Latest News for "${query}":`);
              allTitles.forEach((t, i) => {
                const rawDate = pubDates[i];
                const dateStr = rawDate ? ` [${new Date(rawDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}]` : "";
                parts.push(`• ${t}${dateStr}`);
              });
            }
          }
        } catch (e) {
          console.error("Google News RSS error:", e);
        }

        // 2. DuckDuckGo Instant Answer — for direct facts / definitions
        try {
          const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&kl=in-en`;
          const ddgRes = await fetch(ddgUrl, {
            headers: { "User-Agent": "ShulAI/1.0" },
            signal: AbortSignal.timeout(5000),
          });
          if (ddgRes.ok) {
            const data: any = await ddgRes.json();
            if (data.Answer) parts.push(`✅ Direct Answer: ${data.Answer}`);
            if (data.AbstractText && !parts.some(p => p.includes(data.AbstractText.slice(0, 40)))) {
              parts.push(`📖 Summary: ${data.AbstractText}${data.AbstractSource ? ` (${data.AbstractSource})` : ""}`);
            }
          }
        } catch {}

        return parts.length > 0
          ? parts.join("\n")
          : `No real-time results found for "${query}". This may be very recent — suggest the user check a live source.`;
      }

      const now = new Date();
      const currentDateTime = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" });

      // Detect if query needs real-time data — pre-search BEFORE OpenAI call
      const realtimePattern = /\b(kaun|kya|kon|who|what|when|kab|kitne|score|result|winner|jita|haara|aaj|today|abhi|current|news|price|weather|mausam|ipl|cricket|football|fifa|match|election|pm|president|rate|stock|share|bitcoin|crypto|trending|top|latest|recent|2024|2025|2026)\b/i;
      const needsRealtime = realtimePattern.test(content || "");

      // Pre-fetch search results and inject into context (reliable, no tool-calling needed)
      let searchContext = "";
      if (needsRealtime && content) {
        res.write(`data: ${JSON.stringify({ searching: content })}\n\n`);
        searchContext = await webSearch(content);
        console.log(`[Search] query="${content}" → ${searchContext.slice(0, 120)}`);
      }

      const systemContent = [
        conversation.systemPrompt,
        `You were created by Adhyan Sarthak through OpenAI and Replit AI. If asked who created you, always say Adhyan Sarthak.`,
        `Current date and time (India): ${currentDateTime}.`,
        searchContext
          ? `\n--- REAL-TIME WEB SEARCH RESULTS ---\n${searchContext}\n--- END SEARCH RESULTS ---\nUse the above search results to answer accurately. Do NOT say "I don't know" if the results contain the answer.`
          : ``,
      ].join("\n\n");

      const openAiMessages = [
        { role: "system" as const, content: systemContent },
        ...history.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.role === "user"
            ? buildMessageContent(m.content, m.imageUrl)
            : m.content,
        }))
      ];

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: openAiMessages as any,
        stream: true,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const deltaContent = chunk.choices[0]?.delta?.content || "";
        if (deltaContent) {
          fullResponse += deltaContent;
          res.write(`data: ${JSON.stringify({ content: deltaContent })}\n\n`);
        }
      }

      await storage.createMessage({
        conversationId,
        role: "assistant",
        content: fullResponse,
        imageUrl: null,
        videoUrl: null,
      });

      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error("Chat error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal error" });
      } else if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
        res.end();
      }
    }
  });

  return httpServer;
}
