import { useState } from "react";
import { clsx } from "clsx";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ShulAvatar } from "./ShulAvatar";
import { Loader2, ImageIcon, ExternalLink, Volume2 } from "lucide-react";

interface ChatBubbleProps {
  role: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt?: Date | string;
  isStreaming?: boolean;
  isGeneratingImage?: boolean;
  onSpeak?: () => void;
}

function resolveImageSrc(imageUrl: string): string {
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("/")) return imageUrl;
  return `/objects/${imageUrl}`;
}

function GeneratedImage({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="mb-2">
      {!loaded && !error && (
        <div className="flex items-center justify-center gap-2 h-48 w-64 rounded-2xl bg-gradient-to-br from-cyan-50 to-pink-50 border border-cyan-100">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          <span className="text-xs text-cyan-500 font-medium">Loading image...</span>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center gap-2 h-32 w-64 rounded-2xl bg-red-50 border border-red-100">
          <ImageIcon className="w-6 h-6 text-red-300" />
          <span className="text-xs text-red-400">Image failed to load</span>
          <a href={src} target="_blank" rel="noopener noreferrer"
            className="text-xs text-cyan-500 underline flex items-center gap-1">
            Open link <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
      <img
        src={src}
        alt="AI Generated"
        style={{ display: loaded && !error ? "block" : "none" }}
        className="max-w-full max-h-80 rounded-2xl shadow-md border border-cyan-100 cursor-pointer hover:opacity-90 transition-opacity"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        onClick={() => window.open(src, "_blank")}
      />
      {loaded && !error && (
        <button
          onClick={() => window.open(src, "_blank")}
          className="mt-1 flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-600 font-medium"
        >
          <ExternalLink className="w-3 h-3" /> Open full size
        </button>
      )}
    </div>
  );
}

export function ChatBubble({
  role, content, imageUrl, videoUrl, createdAt, isStreaming, isGeneratingImage, onSpeak,
}: ChatBubbleProps) {
  const isUser = role === "user";
  const isGenImage = imageUrl?.includes("pollinations.ai") || imageUrl?.startsWith("https://image.pollinations");
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!onSpeak || speaking) return;
    setSpeaking(true);
    onSpeak();
    // Reset after a reasonable time
    setTimeout(() => setSpeaking(false), 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={clsx("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="mr-2 mt-1 flex-shrink-0">
          <ShulAvatar size="sm" isThinking={isStreaming} />
        </div>
      )}

      <div className={clsx("max-w-[80%] md:max-w-[70%] flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div className={clsx(
          "px-4 py-2.5 rounded-2xl relative",
          isUser ? "bubble-user rounded-br-sm" : "bubble-ai rounded-bl-sm"
        )}>

          {/* User uploaded image */}
          {imageUrl && !isGenImage && (
            <div className="mb-2">
              <img
                src={resolveImageSrc(imageUrl)}
                alt="Uploaded"
                className="max-w-full max-h-64 rounded-xl shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(resolveImageSrc(imageUrl), "_blank")}
              />
            </div>
          )}

          {/* AI generated image */}
          {imageUrl && isGenImage && (
            <GeneratedImage src={imageUrl} />
          )}

          {/* Video */}
          {videoUrl && (
            <div className="mb-2">
              <video src={videoUrl} controls className="max-w-full rounded-xl shadow-sm" />
            </div>
          )}

          {/* Image generating spinner (streaming state) */}
          {isGeneratingImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-4 px-6"
            >
              <div className="relative">
                <motion.div
                  className="w-14 h-14 rounded-2xl"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #ec4899, #fbbf24)" }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-1 rounded-xl bg-white flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-cyan-500" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-cyan-600">🎨 Generating image...</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Creating your artwork with AI</p>
              </div>
            </motion.div>
          )}

          {/* Text content */}
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed text-sm text-white">{content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:text-slate-700 prose-headings:text-slate-800 prose-code:text-cyan-600 prose-pre:bg-cyan-50 prose-pre:border prose-pre:border-cyan-200 prose-strong:text-cyan-700">
              {!isGeneratingImage && content ? <ReactMarkdown>{content}</ReactMarkdown> : null}
              {isStreaming && !isGeneratingImage && (
                <motion.span
                  className="inline-flex gap-1 ml-1 align-middle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </motion.span>
              )}
            </div>
          )}

          {/* Speaker button — bottom-right of AI messages only (not while streaming) */}
          {!isUser && !isStreaming && !isGeneratingImage && content && onSpeak && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleSpeak}
              title="Speak this message"
              className="absolute bottom-1.5 right-2 rounded-full p-1 transition-all"
              style={{
                background: speaking
                  ? "linear-gradient(135deg, #06b6d4, #0891b2)"
                  : "rgba(6,182,212,0.1)",
                color: speaking ? "white" : "#06b6d4",
              }}
            >
              <Volume2 className="w-3 h-3" />
            </motion.button>
          )}
        </div>

        {createdAt && !isStreaming && (
          <span className="text-[10px] px-1 text-slate-400 font-medium">
            {format(new Date(createdAt), "h:mm a")}
          </span>
        )}
      </div>
    </motion.div>
  );
}
