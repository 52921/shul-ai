import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mic, MicOff } from "lucide-react";
import { CuteRobot, type RobotMood } from "./CuteRobot";
import { Button } from "@/components/ui/button";
import { useSpeechRecord } from "@/hooks/use-speech-record";

interface VoiceCallOverlayProps {
  isVisible: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  characterName: string;
  mood: RobotMood;
  onClose: () => void;
  onUserMessage: (text: string) => void;
}

export function VoiceCallOverlay({
  isVisible,
  isSpeaking,
  isThinking,
  characterName,
  mood,
  onClose,
  onUserMessage,
}: VoiceCallOverlayProps) {
  const [userTalking, setUserTalking] = useState(false);
  const [liveText, setLiveText] = useState("");

  const { isRecording, transcript, startRecording, stopRecording } = useSpeechRecord({
    onResult: (text) => {
      setLiveText(text);
      onUserMessage(text);
      setLiveText("");
      setUserTalking(false);
    },
    onError: () => setUserTalking(false),
  });

  // Stop recording when AI starts speaking
  useEffect(() => {
    if (isSpeaking && isRecording) {
      stopRecording();
      setUserTalking(false);
    }
  }, [isSpeaking, isRecording, stopRecording]);

  // Stop recording when overlay closes
  useEffect(() => {
    if (!isVisible) {
      stopRecording();
      setUserTalking(false);
      setLiveText("");
    }
  }, [isVisible, stopRecording]);

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
      setUserTalking(false);
    } else {
      setLiveText("");
      setUserTalking(true);
      startRecording();
    }
  };

  const callStatus = isSpeaking
    ? "🔊 Speaking..."
    : isThinking
    ? "💭 Thinking..."
    : userTalking
    ? "🎙️ You're talking..."
    : "📞 On call";

  const callStatusColor = userTalking
    ? "#f43f5e"
    : isSpeaking
    ? "#06b6d4"
    : isThinking
    ? "#a78bfa"
    : "#22c55e";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 40 }}
          transition={{ type: "spring", damping: 18, stiffness: 280 }}
          className="fixed bottom-28 right-4 z-50 w-[210px] rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #ffffff 0%, #e0f7fa 60%, #fce4ec 100%)",
            boxShadow: "0 8px 40px rgba(6,182,212,0.25), 0 2px 12px rgba(0,0,0,0.1)",
            border: "1.5px solid rgba(6,182,212,0.3)",
          }}
        >
          <div className="p-4 flex flex-col items-center gap-3">
            {/* Status row */}
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: callStatusColor }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase"
                style={{ color: callStatusColor }}>
                {callStatus}
              </p>
            </div>

            {/* Robot */}
            <CuteRobot mood={userTalking ? "surprised" : mood} size={100} floating={true} />

            {/* Name */}
            <div className="text-center">
              <h3 className="text-slate-700 font-bold text-base font-cute">{characterName}</h3>
              <p className="text-cyan-500 text-[11px] font-semibold mt-0.5">Cute AI Friend ✨</p>
            </div>

            {/* AI waveform (when speaking) */}
            {isSpeaking && (
              <div className="flex items-center gap-1 h-6">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 rounded-full bg-gradient-to-t from-cyan-500 to-pink-400"
                    animate={{ height: ["4px", `${10 + i % 3 * 8}px`, "4px"] }}
                    transition={{ duration: 0.3 + i * 0.06, repeat: Infinity, delay: i * 0.05 }}
                  />
                ))}
              </div>
            )}

            {/* Live transcript while user is speaking */}
            <AnimatePresence>
              {userTalking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full rounded-2xl px-3 py-2 text-center"
                  style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}
                >
                  <p className="text-[11px] text-rose-500 font-semibold leading-snug">
                    {liveText || "🎙️ Say something…"}
                  </p>
                  {/* User waveform */}
                  <div className="flex items-end justify-center gap-0.5 mt-1.5">
                    {[4, 7, 10, 7, 4].map((h, i) => (
                      <motion.div key={i}
                        className="w-1 rounded-full bg-rose-400"
                        animate={{ height: [`${h}px`, `${h * 2}px`, `${h}px`] }}
                        transition={{ duration: 0.28 + i * 0.04, repeat: Infinity, delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons row: Mic + Hang up */}
            <div className="flex items-center gap-3 mt-1">
              {/* Mic toggle button */}
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
                <Button
                  type="button"
                  size="icon"
                  disabled={isSpeaking || isThinking}
                  onClick={handleMicToggle}
                  className="rounded-full w-11 h-11 border-0 text-white shadow-md"
                  style={{
                    background: userTalking
                      ? "linear-gradient(135deg, #f43f5e, #e11d48)"
                      : "linear-gradient(135deg, #ec4899, #db2777)",
                    boxShadow: userTalking
                      ? "0 0 0 3px rgba(244,63,94,0.3), 0 4px 14px rgba(244,63,94,0.4)"
                      : "0 4px 12px rgba(236,72,153,0.35)",
                  }}
                >
                  {userTalking
                    ? <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.7, repeat: Infinity }}>
                        <MicOff className="w-5 h-5" />
                      </motion.div>
                    : <Mic className="w-5 h-5" />
                  }
                </Button>
              </motion.div>

              {/* Hang up button */}
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
                <Button
                  onClick={onClose}
                  size="icon"
                  className="rounded-full w-11 h-11 bg-red-400 hover:bg-red-500 text-white border-0 shadow-md"
                >
                  <Phone className="w-5 h-5 rotate-[135deg]" />
                </Button>
              </motion.div>
            </div>

            <p className="text-[9px] text-slate-300 font-medium mt-0.5">
              Tap 🎙️ to speak • Tap 📞 to end
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
