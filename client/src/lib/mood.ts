import type { RobotMood } from "@/components/CuteRobot";

export function detectMood(text: string, isStreaming: boolean, isSpeaking: boolean): RobotMood {
  if (isSpeaking) return "speaking";
  if (isStreaming) return "thinking";
  if (!text) return "idle";
  const t = text.toLowerCase();
  if (/sorry|unfortunately|can't|cannot|unable|sad|bad|wrong|fail|error/.test(t)) return "sad";
  if (/wow|amazing|incredible|awesome|fantastic|excellent|brilliant|great|wonderful/.test(t)) return "excited";
  if (/what\?|really\?|seriously\?|unexpected|surprising|interesting/.test(t)) return "surprised";
  return "happy";
}
