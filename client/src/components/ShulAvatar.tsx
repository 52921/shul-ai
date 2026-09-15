import { motion } from "framer-motion";
import robotImg from "@assets/robot-nobg.png";
import { type RobotMood } from "./CuteRobot";

interface ShulAvatarProps {
  size?: "sm" | "md" | "lg";
  isSpeaking?: boolean;
  isThinking?: boolean;
  className?: string;
}

const sizeMap: Record<string, number> = { sm: 36, md: 52, lg: 72, xl: 80 };

export function ShulAvatar({ size = "md", isSpeaking = false, isThinking = false, className = "" }: ShulAvatarProps) {
  const px = sizeMap[size] ?? 52;

  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: px + 6, height: px + 6 }}
    >
      {/* Pulse ring when speaking */}
      {isSpeaking && (
        <motion.div
          className="absolute rounded-full border-2 border-cyan-400"
          style={{ width: px + 10, height: px + 10 }}
          animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      )}

      {/* Avatar circle */}
      <div
        className="rounded-full overflow-hidden bg-cyan-50 border-2 flex items-center justify-center relative z-10"
        style={{
          width: px,
          height: px,
          borderColor: isSpeaking ? "#06b6d4" : isThinking ? "#a855f7" : "#e0f7fa",
          boxShadow: isSpeaking ? "0 0 12px rgba(6,182,212,0.4)" : "0 2px 8px rgba(6,182,212,0.15)",
        }}
      >
        <img
          src={robotImg}
          alt="Shul AI"
          draggable={false}
          style={{
            width: px * 1.1,
            height: px * 1.1,
            objectFit: "contain",
            objectPosition: "center",
            marginTop: px * 0.08,
          }}
        />
      </div>

      {/* Status dot */}
      <div
        className="absolute bottom-0 right-0 z-20 rounded-full border-2 border-white shadow-sm"
        style={{
          width: Math.max(px * 0.24, 8),
          height: Math.max(px * 0.24, 8),
          background: isSpeaking ? "#06b6d4" : isThinking ? "#a855f7" : "#22c55e",
        }}
      />
    </div>
  );
}
