import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import robotImg from "@assets/robot-nobg.png";

export type RobotMood = "idle" | "thinking" | "happy" | "excited" | "surprised" | "sad" | "speaking";

const moodEmoji: Record<RobotMood, string> = {
  idle: "",
  happy: "😊",
  thinking: "🤔",
  excited: "🤩",
  surprised: "😲",
  sad: "😢",
  speaking: "🗣️",
};

const moodFilter: Record<RobotMood, string> = {
  idle: "none",
  happy: "brightness(1.05) saturate(1.1)",
  thinking: "brightness(0.9) saturate(0.7)",
  excited: "brightness(1.15) saturate(1.4)",
  surprised: "brightness(1.1) saturate(1.2)",
  sad: "brightness(0.8) saturate(0.4) grayscale(0.4)",
  speaking: "brightness(1.1) saturate(1.2)",
};

const CELEBRATION_EMOJIS = ["✨","🎉","💫","🌟","❤️","🎊","😍","🥳","🌈","🎈","💥","⭐","🔥","🍭","💖","🎀"];

interface Particle {
  id: number;
  emoji: string;
  angle: number;
  dist: number;
  rotate: number;
}

interface CuteRobotProps {
  mood?: RobotMood;
  size?: number;
  floating?: boolean;
  flying?: boolean;
  draggable?: boolean;
  className?: string;
}

export function CuteRobot({
  mood = "idle",
  size = 120,
  floating = false,
  flying = false,
  draggable = false,
  className = "",
}: CuteRobotProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [bounce, setBounce] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const restTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const emoji = moodEmoji[mood];

  // Mouse tracking — face the cursor at all times
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      setFacingRight(e.clientX >= centerX);
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Double-tap / double-click handler
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      // Double tap! Fire celebration
      const newParticles: Particle[] = Array.from({ length: 14 }, (_, i) => ({
        id: Date.now() + i,
        emoji: CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)],
        angle: (i / 14) * 360 + Math.random() * 20,
        dist: 55 + Math.random() * 55,
        rotate: Math.random() * 360,
      }));
      setParticles(newParticles);
      setCelebrating(true);
      setBounce(true);
      setTimeout(() => { setCelebrating(false); setBounce(false); }, 1200);
      setTimeout(() => setParticles([]), 1400);
    }
    lastTapRef.current = now;
  }, []);

  // Flying: medium speed, pause at each end
  // x: [-65, -65, 65, 65, -65]  with times that pause at each end
  const flyingAnim = flying && !isDragging ? {
    x: [-65, -65, 65, 65, -65],
    y: [0, -6, 6, -6, 0],
  } : {};
  const flyingTrans = flying && !isDragging ? {
    duration: 3.2,
    times: [0, 0.16, 0.5, 0.66, 1],
    repeat: Infinity,
    ease: "easeInOut",
  } : { duration: 0 };

  // Image flip:
  // - While flying → keyframe-driven direction flip
  // - Otherwise → follow mouse (facingRight)
  const isFlying = flying && !isDragging && !isResting;
  const imgFlipAnim = isFlying
    ? { scaleX: [1, 1, 1, -1, -1, -1, 1] }
    : { scaleX: facingRight ? 1 : -1 };
  const imgFlipTrans = isFlying
    ? { duration: 3.2, times: [0, 0.15, 0.499, 0.5, 0.65, 0.999, 1], repeat: Infinity, ease: "linear" }
    : { duration: 0.18, ease: "easeOut" };

  // Gentle float
  const floatAnim = floating && !isDragging && !flying
    ? { y: [0, -12, -4, -16, 0], rotate: [-1, 1, -0.5, 0.5, -1] }
    : {};
  const floatTrans = floating && !isDragging && !flying
    ? { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
    : { duration: 0 };

  // Bounce on celebration
  const bounceAnim = bounce ? { scale: [1, 1.35, 0.88, 1.18, 0.95, 1.05, 1] } : {};
  const bounceTrans = bounce ? { duration: 0.7, ease: "easeOut" } : {};

  return (
    <motion.div
      ref={containerRef}
      className={`relative select-none ${draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} ${className}`}
      style={{ width: size, height: size, touchAction: "none" }}
      drag={draggable}
      dragMomentum={false}
      dragElastic={0.05}
      onDragStart={() => {
        setIsDragging(true);
        setIsResting(false);
        if (restTimerRef.current) clearTimeout(restTimerRef.current);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setIsResting(true);
        if (restTimerRef.current) clearTimeout(restTimerRef.current);
        restTimerRef.current = setTimeout(() => setIsResting(false), 20000);
      }}
      whileDrag={{ scale: 1.12, zIndex: 999 }}
      animate={
        bounce ? bounceAnim :
        (flying && !isDragging && !isResting) ? flyingAnim :
        floatAnim
      }
      transition={
        bounce ? bounceTrans :
        (flying && !isDragging && !isResting) ? flyingTrans :
        floatTrans
      }
      onTap={handleTap}
      onClick={handleTap}
    >
      {/* Celebration emoji particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.3, rotate: 0 }}
            animate={{
              opacity: [1, 1, 0],
              x: Math.cos((p.angle * Math.PI) / 180) * p.dist,
              y: Math.sin((p.angle * Math.PI) / 180) * p.dist,
              scale: [0.3, 1.3, 0.8],
              rotate: p.rotate,
            }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              fontSize: size * 0.24,
              lineHeight: 1,
              pointerEvents: "none",
              zIndex: 100,
              marginLeft: "-0.5em",
              marginTop: "-0.5em",
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Celebration ring ripple */}
      <AnimatePresence>
        {celebrating && (
          <>
            {[0, 1].map((i) => (
              <motion.div
                key={`ring-${i}`}
                initial={{ scale: 0.5, opacity: 0.9 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.7 + i * 0.2, delay: i * 0.15, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `3px solid ${i === 0 ? "#06b6d4" : "#ec4899"}`,
                  pointerEvents: "none",
                  zIndex: 90,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Robot image */}
      <motion.img
        src={robotImg}
        alt="Shul AI Robot"
        draggable={false}
        animate={imgFlipAnim}
        transition={imgFlipTrans}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          filter: celebrating
            ? "brightness(1.3) saturate(1.6)"
            : moodFilter[mood],
          transition: "filter 0.4s ease",
          display: "block",
        }}
      />

      {/* Mood emoji badge */}
      {emoji && (
        <motion.div
          key={mood}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 280 }}
          style={{
            position: "absolute",
            top: size * 0.02,
            right: size * 0.02,
            fontSize: size * 0.22,
            lineHeight: 1,
            pointerEvents: "none",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.18))",
          }}
        >
          {emoji}
        </motion.div>
      )}

      {/* Double-tap hint — fades after a moment */}
      {draggable && !isDragging && !celebrating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0] }}
          transition={{ duration: 2.5, delay: 2, repeat: 1 }}
          style={{
            position: "absolute",
            bottom: -28,
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontSize: 10,
            fontWeight: 700,
            color: "#0891b2",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 20,
            padding: "2px 8px",
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(6,182,212,0.2)",
          }}
        >
          ✋ Drag • 👆👆 Double-tap!
        </motion.div>
      )}

      {/* Thinking dots */}
      {mood === "thinking" && (
        <div style={{
          position: "absolute",
          bottom: -22,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 4,
        }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#06b6d4" }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      )}

      {/* Speaking waveform */}
      {mood === "speaking" && (
        <div style={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}>
          {[3, 5, 8, 5, 3].map((h, i) => (
            <motion.div
              key={i}
              style={{ width: 5, borderRadius: 4, background: "linear-gradient(to top, #06b6d4, #ec4899)" }}
              animate={{ height: [`${h}px`, `${h * 2.5}px`, `${h}px`] }}
              transition={{ duration: 0.35 + i * 0.05, repeat: Infinity, delay: i * 0.07 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
