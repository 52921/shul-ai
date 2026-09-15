import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useConversation } from "@/hooks/use-conversations";
import { useChat } from "@/hooks/use-chat";
import { useVoice } from "@/hooks/use-voice";
import { useSpeechRecord } from "@/hooks/use-speech-record";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MoreVertical, Send, Loader2, ImagePlus, X, PhoneCall, Mic } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ChatBubble } from "./ChatBubble";
import { ConversationSettingsModal } from "./ConversationSettingsModal";
import { useUpload } from "@/hooks/use-upload";
import { ShulAvatar } from "./ShulAvatar";
import { VoiceCallOverlay } from "./VoiceCallOverlay";
import { CuteRobot, type RobotMood } from "./CuteRobot";
import { detectMood } from "@/lib/mood";
import { motion, AnimatePresence } from "framer-motion";

export function ChatArea({ id }: { id: number }) {
  const { data: conversation, isLoading } = useConversation(id);
  const { sendMessage, isStreaming, streamingMessage, isGeneratingImage, isSearching, optimisticUserMessage } = useChat({ conversationId: id });

  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ url: string; path: string } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState<RobotMood>("idle");
  const [isDragOver, setIsDragOver] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number | null>(null);
  const dragCounterRef = useRef(0);

  const { speak, stop } = useVoice();

  const { isRecording, isTranscribing, transcript, startRecording, stopRecording } = useSpeechRecord({
    onResult: (text) => {
      setInput(prev => prev ? prev + " " + text : text);
    },
    onError: (err) => console.warn("Speech error:", err),
  });

  // Hold-to-record: press = start, release = stop & transcribe
  const handleMicDown = () => {
    if (isRecording || isTranscribing) return;
    stop();
    startRecording();
  };
  const handleMicUp = () => {
    if (isRecording) stopRecording();
  };

  // Clean text for speaking
  const cleanForSpeak = (text: string) =>
    text.replace(/#{1,6}\s+/g, "").replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1").replace(/\n+/g, ". ")
      .substring(0, 600);

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (res) => setSelectedImage({ url: res.objectPath, path: res.objectPath }),
  });

  // Drag & drop handlers — use a counter to handle child element re-enters
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragOver(false);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith("image/") || f.type.startsWith("video/") || f.size > 0);
    if (file) uploadFile(file);
  };

  // Paste handler — supports Ctrl+V image paste from clipboard
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith("image/"));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) uploadFile(file);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [conversation?.messages, streamingMessage, optimisticUserMessage]);

  useEffect(() => {
    if (isStreaming) setCurrentMood("thinking");
    else if (isSpeaking) setCurrentMood("speaking");
  }, [isStreaming, isSpeaking]);

  useEffect(() => {
    if (!conversation?.messages) return;
    const msgs = conversation.messages;
    const count = msgs.length;

    if (prevMessageCountRef.current === null) {
      prevMessageCountRef.current = count;
      if (count > 0) {
        const last = msgs[count - 1];
        if (last.role === "assistant") setCurrentMood(detectMood(last.content, false, false));
      }
      return;
    }

    if (count > prevMessageCountRef.current) {
      const last = msgs[count - 1];
      if (last.role === "assistant" && last.content) {
        const mood = detectMood(last.content, false, false);
        setCurrentMood(mood);
      }
    }
    prevMessageCountRef.current = count;
  }, [conversation?.messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isStreaming) return;
    stop(); setIsSpeaking(false); setCurrentMood("thinking");
    sendMessage({ content: input, imageUrl: selectedImage?.path });
    setInput(""); setSelectedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center chat-bg h-full">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
    </div>
  );

  if (!conversation) return (
    <div className="flex-1 flex items-center justify-center h-full text-slate-400">Conversation not found.</div>
  );

  const hasMessages = conversation.messages.length > 0 || !!optimisticUserMessage;

  return (
    <div
      className="flex-1 flex flex-col h-full relative overflow-hidden chat-bg"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
        <div className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
      </div>

      {/* Drag & Drop overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
            style={{
              background: "rgba(6,182,212,0.10)",
              backdropFilter: "blur(6px)",
              border: "3px dashed rgba(6,182,212,0.6)",
              borderRadius: 24,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1], y: [0, -8, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-4 select-none"
            >
              📂
            </motion.div>
            <p className="text-cyan-600 font-black text-xl tracking-wide">Drop your file here!</p>
            <p className="text-cyan-400 font-semibold text-sm mt-1">Photo, image — anything works ✨</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-20 h-[60px] md:h-[65px] flex items-center justify-between px-4 flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(6,182,212,0.15)",
          boxShadow: "0 2px 16px rgba(6,182,212,0.08)",
        }}
      >
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Link href="/">
            <Button variant="ghost" size="icon" className="md:hidden -ml-2 rounded-full h-8 w-8 text-cyan-600 hover:bg-cyan-50">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <ShulAvatar size="sm" isSpeaking={isSpeaking} isThinking={isStreaming} />
          <div className="min-w-0">
            <h2 className="font-cute font-black text-sm text-cyan-700 leading-none truncate pr-2">
              {conversation.characterName}
            </h2>
            <p className="text-[10px] text-pink-400 font-bold mt-0.5">
              {isSpeaking ? "🔊 Speaking..." : isStreaming ? "💭 Thinking..." : "✨ Ready to chat!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsVoiceCallOpen(v => !v)}
            className="rounded-full h-9 w-9 text-cyan-500 hover:bg-cyan-50">
            <PhoneCall className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}
            className="rounded-full h-9 w-9 text-slate-400 hover:bg-slate-50">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5 hide-scrollbar scroll-smooth relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full">

          {/* Empty state */}
          {!hasMessages && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-10 gap-5"
            >
              <CuteRobot mood="happy" size={180} floating={true} />
              <div className="text-center">
                <h3 className="font-cute text-2xl font-black text-gradient-cyan">
                  Hi! I'm {conversation.characterName}! 👋
                </h3>
                <p className="text-slate-400 text-sm mt-1 max-w-xs">
                  I'm your AI friend! Ask me anything~
                </p>
                <div className="flex gap-2 justify-center mt-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-600">💬 Chat</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-600">🎨 Images</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-600">🔊 Voice</span>
                </div>
              </div>
            </motion.div>
          )}

          {conversation.messages.map((msg) => (
            <ChatBubble key={msg.id} role={msg.role} content={msg.content}
              imageUrl={msg.imageUrl} videoUrl={msg.videoUrl} createdAt={msg.createdAt}
              onSpeak={msg.role === "assistant" && msg.content ? () => {
                stop(); setIsSpeaking(true);
                speak(cleanForSpeak(msg.content), () => setIsSpeaking(true), () => setIsSpeaking(false));
              } : undefined}
            />
          ))}

          {optimisticUserMessage && (
            <ChatBubble role="user" content={optimisticUserMessage.content} imageUrl={optimisticUserMessage.imageUrl} />
          )}
          {isSearching && !streamingMessage && (
            <div className="flex items-start gap-2 px-1">
              <div className="rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2 max-w-xs"
                style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.08))", border: "1.5px solid rgba(139,92,246,0.25)" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                  <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </motion.div>
                <span className="text-violet-600 font-medium">🔍 Searching: <span className="text-violet-400 font-normal">{isSearching}</span></span>
              </div>
            </div>
          )}
          {(isStreaming || streamingMessage || isGeneratingImage) && (
            <ChatBubble role="assistant" content={streamingMessage || ""} isStreaming={!isGeneratingImage} isGeneratingImage={isGeneratingImage} />
          )}
        </div>
      </div>

      {/* Draggable floating robot — always visible when chatting */}
      <AnimatePresence>
        {hasMessages && (
          <motion.div
            key="floating-robot"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: "fixed",
              bottom: 110,
              right: 20,
              zIndex: 40,
            }}
          >
            <CuteRobot
              mood={currentMood}
              size={118}
              flying={true}
              draggable={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="relative z-20 p-3 md:p-4 flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(6,182,212,0.15)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {selectedImage && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="mb-2 relative inline-block">
                <img src={selectedImage.url} alt="Preview"
                  className="h-16 w-16 object-cover rounded-xl border-2 border-cyan-200 shadow-sm" />
                <button onClick={() => setSelectedImage(null)}
                  className="absolute -top-1.5 -right-1.5 bg-red-400 rounded-full p-0.5 shadow-sm">
                  <X className="w-3 h-3 text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recording / Transcribing banner */}
          <AnimatePresence>
            {(isRecording || isTranscribing) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 px-3 py-2 rounded-2xl flex items-center gap-2"
                style={{
                  background: isTranscribing
                    ? "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.1))"
                    : "linear-gradient(135deg, rgba(236,72,153,0.1), rgba(6,182,212,0.1))",
                  border: isTranscribing
                    ? "1.5px solid rgba(139,92,246,0.4)"
                    : "1.5px solid rgba(236,72,153,0.3)",
                }}
              >
                {isTranscribing ? (
                  <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin flex-shrink-0" />
                ) : (
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                )}
                <span className={`text-xs font-bold flex-1 ${isTranscribing ? "text-violet-500" : "text-pink-500"}`}>
                  {isTranscribing ? "⚡ Transcribing with Whisper AI..." : (transcript || "🎙️ Recording... tap 🛑 to stop")}
                </span>
                {isRecording && !isTranscribing && (
                  <div className="flex items-end gap-0.5">
                    {[3, 5, 8, 5, 3].map((h, i) => (
                      <motion.div key={i}
                        className="w-1 rounded-full bg-pink-400"
                        animate={{ height: [`${h}px`, `${h * 2.2}px`, `${h}px`] }}
                        transition={{ duration: 0.35 + i * 0.05, repeat: Infinity, delay: i * 0.06 }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend}
            className="flex items-end gap-2 rounded-2xl p-1.5 pl-2"
            style={{
              background: isRecording ? "rgba(254,242,242,0.95)" : isTranscribing ? "rgba(245,243,255,0.95)" : "white",
              border: isRecording ? "2px solid rgba(236,72,153,0.4)" : isTranscribing ? "2px solid rgba(139,92,246,0.4)" : "2px solid rgba(6,182,212,0.25)",
              boxShadow: "0 2px 16px rgba(6,182,212,0.1)",
              transition: "border-color 0.3s, background 0.3s",
            }}
          >
            {/* Image upload button */}
            <div>
              <input type="file" id="image-upload" className="hidden" accept="image/*"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
                disabled={isUploading} />
              <Button type="button" variant="ghost" size="icon" disabled={isUploading || isStreaming || isRecording}
                className="rounded-full w-9 h-9 text-cyan-400 hover:text-cyan-600 hover:bg-cyan-50"
                onClick={() => document.getElementById('image-upload')?.click()}>
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              </Button>
            </div>

            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={
                isRecording ? "🎙️ Recording... tap stop when done"
                : isTranscribing ? "⚡ Transcribing..."
                : "Type, paste 📋 or drop 📂 a photo..."
              }
              className="min-h-[40px] max-h-28 w-full resize-none border-0 bg-transparent py-2.5 focus-visible:ring-0 px-0 hide-scrollbar text-sm text-slate-700 placeholder:text-slate-300"
              rows={1}
              readOnly={isRecording || isTranscribing}
            />

            {/* Mic button — hold to record, release to transcribe */}
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Button
                type="button"
                size="icon"
                disabled={isStreaming || isTranscribing}
                onMouseDown={handleMicDown}
                onMouseUp={handleMicUp}
                onMouseLeave={handleMicUp}
                onTouchStart={(e) => { e.preventDefault(); handleMicDown(); }}
                onTouchEnd={(e) => { e.preventDefault(); handleMicUp(); }}
                title={isRecording ? "Release to send" : isTranscribing ? "Transcribing..." : "Hold to record"}
                className="rounded-full w-9 h-9 shrink-0 border-0 text-white select-none"
                style={{
                  background: isTranscribing
                    ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                    : isRecording
                    ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                    : "linear-gradient(135deg, #ec4899, #db2777)",
                  boxShadow: isTranscribing
                    ? "0 4px 12px rgba(139,92,246,0.4)"
                    : isRecording
                    ? "0 0 0 4px rgba(244,63,94,0.4), 0 4px 16px rgba(244,63,94,0.5)"
                    : "0 4px 12px rgba(236,72,153,0.3)",
                  transition: "all 0.15s ease",
                }}
              >
                {isTranscribing
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : isRecording
                  ? <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }}><Mic className="w-4 h-4" /></motion.div>
                  : <Mic className="w-4 h-4" />
                }
              </Button>
            </motion.div>

            {/* Send button */}
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Button type="submit" size="icon"
                disabled={(!input.trim() && !selectedImage) || isStreaming || isUploading}
                className="rounded-full w-9 h-9 shrink-0 mb-0.5 mr-0.5 border-0 text-white disabled:opacity-30"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                  boxShadow: "0 4px 12px rgba(6,182,212,0.35)",
                }}>
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </motion.div>
          </form>

          <p className="text-center text-[9px] mt-1.5 font-medium text-slate-300 tracking-wider">
            SHUL AI · Adhyan Sarthak · OpenAI & Replit ✨
          </p>
        </div>
      </div>

      <VoiceCallOverlay
        isVisible={isVoiceCallOpen}
        isSpeaking={isSpeaking}
        isThinking={isStreaming}
        mood={currentMood}
        characterName={conversation.characterName}
        onClose={() => { setIsVoiceCallOpen(false); stop(); setIsSpeaking(false); }}
        onUserMessage={(text) => {
          if (text.trim()) sendMessage(text.trim(), undefined);
        }}
      />

      <ConversationSettingsModal conversation={conversation} open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
