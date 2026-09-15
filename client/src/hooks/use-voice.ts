import { useRef, useCallback, useEffect } from "react";

// Chrome bug: speechSynthesis pauses after ~15s — keep alive
function startKeepAlive() {
  const synth = window.speechSynthesis;
  if (!synth) return 0 as unknown as ReturnType<typeof setInterval>;
  return setInterval(() => {
    if (synth.speaking) { synth.pause(); synth.resume(); }
  }, 10000);
}

function pickMaleVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Priority: Indian English male
  const priority = [
    "Rishi",                              // macOS Indian English male
    "Microsoft Hemant Desktop",           // Windows Indian male
    "Microsoft Hemant - English (India)", // Windows Indian male
    "Google हिन्दी",                      // Hindi Google voice
    "Microsoft Ravi Desktop",
  ];
  for (const name of priority) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }

  // Any en-IN voice
  const enIn = voices.find(v => v.lang === "en-IN");
  if (enIn) return enIn;

  // Any English male voice by name heuristic
  const enMale = voices.find(
    v => v.lang.startsWith("en") &&
      /\b(male|man|david|mark|daniel|james|george|fred|rishi|hemant|aaron|arthur|oliver)\b/i.test(v.name)
  );
  if (enMale) return enMale;

  // English fallback
  return voices.find(v => v.lang.startsWith("en")) || voices[0] || null;
}

export function useVoice() {
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    keepAliveRef.current = startKeepAlive();
    return () => {
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback((
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
  ) => {
    if (!text?.trim() || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";   // prefer Indian accent
      utterance.pitch = 0.75;     // lower = more masculine
      utterance.rate = 0.95;      // slight slowdown for clarity
      utterance.volume = 1;

      const doSpeak = () => {
        const voice = pickMaleVoice();
        if (voice) utterance.voice = voice;
        utterance.onstart = () => onStart?.();
        utterance.onend = () => onEnd?.();
        utterance.onerror = (e) => {
          if (e.error !== "interrupted" && e.error !== "canceled") onEnd?.();
        };
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = doSpeak;
      } else {
        doSpeak();
      }
    }, 80);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  return { speak, stop };
}
