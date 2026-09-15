import { useState, useRef, useCallback } from "react";

interface UseSpeechRecordOptions {
  onResult: (text: string) => void;
  onError?: (err: string) => void;
}

export function useSpeechRecord({ onResult, onError }: UseSpeechRecordOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Pick best supported mime type
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
        "audio/mp4",
      ].find(t => MediaRecorder.isTypeSupported(t)) || "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (blob.size < 100) {
          setIsRecording(false);
          onError?.("Recording too short. Please try again.");
          return;
        }

        setIsTranscribing(true);
        setTranscript("🔄 Transcribing...");

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": blob.type || "audio/webm" },
            body: blob,
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Transcription failed");
          }

          const { text } = await response.json();
          if (text && text.trim()) {
            setTranscript(text.trim());
            onResult(text.trim());
          } else {
            onError?.("Could not understand. Please try again.");
          }
        } catch (err: any) {
          onError?.(err.message || "Transcription failed");
        } finally {
          setIsTranscribing(false);
          setTranscript("");
          setIsRecording(false);
        }
      };

      recorder.onerror = () => {
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        onError?.("Recording error. Please try again.");
      };

      recorderRef.current = recorder;
      recorder.start(200); // collect data every 200ms
      setIsRecording(true);
      setTranscript("");
    } catch (err: any) {
      const msg = err.name === "NotAllowedError"
        ? "Microphone permission denied. Please allow mic access."
        : err.message || "Could not start recording.";
      onError?.(msg);
    }
  }, [onResult, onError]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    } else {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setIsRecording(false);
    }
  }, []);

  return { isRecording, isTranscribing, transcript, startRecording, stopRecording };
}
