// components/CameraCard.tsx
"use client";
import { useRouter } from "next/navigation";

// inside CameraCard compon


import React, { useEffect, useRef, useState } from "react";

type CameraCardProps = {
  onCapture?: (dataUrl: string) => void;
  onRecord?: (blob: Blob) => void;
  onClose?: () => void;
};

export default function CameraCard({ onCapture, onRecord, onClose }: CameraCardProps) {
  
const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isStreaming, setIsStreaming] = useState(false);
  const [flash, setFlash] = useState(false);

  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [photoEffect, setPhotoEffect] = useState<"normal" | "blur" | "grayscale">("normal");
  const [lastCapture, setLastCapture] = useState<string | null>(() => {
    try {
      return localStorage.getItem("last:capture");
    } catch {
      return null;
    }
  });
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [suggestion, setSuggestion] = useState<string>("Try different modes for Variations");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);

  // Start camera
  const startCamera = async (modeFacing: "user" | "environment", withAudio = false) => {
    setError("");
    setLoading(true);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const videoConstraint: any = { facingMode: { exact: modeFacing } };
      let stream: MediaStream | null = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraint,
          audio: withAudio,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: modeFacing },
          audio: withAudio,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // autoplay might need user gesture
        }
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error("camera start failed", err);
      setError("Unable to access camera. Check permissions and that your device has a camera.");
    } finally {
      setLoading(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Toggle facing
  const toggleFacing = async () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    await startCamera(next, audioEnabled || mode === "video");
  };

  // Toggle audio
  const toggleAudio = async () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    await startCamera(facingMode, next || mode === "video");
  };

  // Capture photo
const capturePhoto = () => {

  if (!videoRef.current || !canvasRef.current) return;
  const video = videoRef.current;
  const canvas = canvasRef.current;

  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.save();

  if (photoEffect === "grayscale") {
    ctx.filter = "grayscale(1)";
  } else if (photoEffect === "blur") {
    ctx.filter = "blur(6px)";
  } else {
    ctx.filter = "none";
  }
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();

  setFlash(true);
  setTimeout(() => setFlash(false), 160);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

  try {
    localStorage.setItem("last:capture", dataUrl);
  } catch {
    console.warn("unable to save capture");
  }
  setLastCapture(dataUrl);

  if (onCapture) onCapture(dataUrl);

  // ✅ Instead of downloading → navigate to Dashboard with this photo
  router.push(`/dashboard?fromCamera=1`);
};

  //
  // Analyze frame
  const analyzeFrame = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const w = Math.min(240, v.videoWidth || 320);
    const h = Math.min(180, v.videoHeight || 240);
    if (w === 0 || h === 0) return;
    const tmp = document.createElement("canvas");
    tmp.width = w;
    tmp.height = h;
    const tctx = tmp.getContext("2d");
    if (!tctx) return;
    tctx.drawImage(v, 0, 0, w, h);
    try {
      const img = tctx.getImageData(0, 0, w, h);
      let sum = 0;
      for (let i = 0; i < img.data.length; i += 4) {
        const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        sum += lum;
      }
      const avg = sum / (w * h);
      if (avg < 50) setSuggestion("Low light — try increasing exposure or enable torch.");
      else if (avg > 210) setSuggestion("Scene is bright — avoid backlight or reduce exposure.");
      else setSuggestion("Good lighting — try grayscale/blur mode too.");
    } catch {
      // ignore
    }
  };

  // Recording
  const startRecording = () => {
    if (!streamRef.current) {
      setError("Camera not started.");
      return;
    }
    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        setIsRecording(false);
        setRecordingTime(0);
        if (onRecord) onRecord(blob);
      };

      recorder.start(100);
      setIsRecording(true);

      let t = 0;
      recordingIntervalRef.current = setInterval(() => {
        t += 1;
        setRecordingTime(t);
      }, 1000);
    } catch (e) {
      console.error("startRecording error", e);
      setError("Recording failed to start.");
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch (e) {
      console.error("stopRecording error", e);
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startCamera(facingMode, true);
      startRecording();
    }
  };

  // Mount
  useEffect(() => {
    if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API not available in this browser.");
      return;
    }

    startCamera(facingMode, audioEnabled || mode === "video");

    return () => {
      stopCamera();
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suggestions
  useEffect(() => {
    let id: number | undefined;
    if (isStreaming) id = window.setInterval(analyzeFrame, 1200);
    return () => {
      if (id) window.clearInterval(id);
    };
  }, [isStreaming]);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 relative">
      <div className="text-center mb-4 text-gray-700 text-lg">
        Try out the SmartGallery app's new in-app camera
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-xl bg-[linear-gradient(180deg,rgba(15,23,36,0.85),rgba(11,18,32,0.75))]">

        {/* Flash overlay */}
        {flash && <div className="absolute inset-0 bg-white opacity-80 animate-pulse pointer-events-none z-50"></div>}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center text-white text-center p-4">
            <p className="mb-2">{error}</p>
            <button
              onClick={() => startCamera(facingMode, audioEnabled || mode === "video")}
              className="px-4 py-2 bg-violet-600 rounded-md"
            >
              Retry
            </button>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={() => { stopCamera(); if (onClose) onClose(); }}
            aria-label="close"
            className="w-9 h-9 rounded-full bg-white/6 backdrop-blur-sm flex items-center justify-center border border-white/6"
            title="Close"
          >
            <svg className="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <button
            onClick={toggleFacing}
            aria-label="Switch camera"
            className="w-9 h-9 rounded-full bg-white/6 backdrop-blur-sm flex items-center justify-center border border-white/6"
            title="Switch camera"
          >
            <svg className="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none">
              <path d="M21 12a9 9 0 11-2.5-6.05" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 3v6h-6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Video preview */}
        <div className="aspect-[16/9] w-full flex items-center justify-center relative bg-black">
          <video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  className={`w-full h-full object-cover ${
    photoEffect === "grayscale"
      ? "filter grayscale"
      : photoEffect === "blur"
      ? "filter blur-md"
      : ""
  }`}
/>

          {!isStreaming && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-2 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-white/6 flex items-center justify-center border border-white/8">
                <svg className="w-7 h-7 text-white/80" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="white" strokeWidth="1.2" opacity="0.7" />
                  <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.2" opacity="0.7" />
                </svg>
              </div>
              <div className="text-white/70 text-sm">Camera Preview</div>
              <div className="text-white/40 text-xs">Live feed would appear here</div>
            </div>
          )}
        </div>

        {/* Suggestion bar */}
        <div className="absolute left-6 right-6 bottom-20 z-20">
          <div className="bg-black/40 backdrop-blur-sm border border-white/8 rounded-full py-2 px-3 flex items-center gap-3 max-w-full">
            <div className="flex-shrink-0 text-xs font-semibold text-white/85">💡 SUGGESTION</div>
            <div className="text-white/80 text-xs truncate max-w-[60vw]">{suggestion}</div>
          </div>
        </div>

        {/* Bottom controls */}
{/* Bottom controls */}
<div className="absolute left-0 right-0 bottom-4 z-30 flex items-center justify-between px-6">

  {/* Left: mode selector */}
  <div className="flex items-center gap-2 bg-black/60 rounded-full px-3 py-2 shadow-md">
    <button
      onClick={() => setMode("photo")}
      className={`text-sm font-medium px-3 py-1 rounded-md transition ${
        mode === "photo" ? "bg-violet-600 text-white" : "text-gray-200 hover:text-white"
      }`}
    >
      Photo
    </button>
    <button
      onClick={() => setMode("video")}
      className={`text-sm font-medium px-3 py-1 rounded-md transition ${
        mode === "video" ? "bg-violet-600 text-white" : "text-gray-200 hover:text-white"
      }`}
    >
      Video
    </button>
  </div>

  {/* Center: Capture/Record button */}
  {mode === "photo" ? (
    <button
      onClick={capturePhoto}
      disabled={!isStreaming}
      aria-label="Capture photo"
      className="relative w-16 h-16 rounded-full bg-white border-2 border-white/20 flex items-center justify-center shadow-lg disabled:opacity-50"
    >
      <div className={`w-10 h-10 rounded-full ${loading ? "bg-gray-300 animate-pulse" : "bg-violet-600"}`} />
    </button>
  ) : (
    <button
      onClick={toggleRecording}
      disabled={!isStreaming}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2 ${
        isRecording
          ? "bg-red-600 border-red-700 animate-pulse"
          : "bg-white border-white/20"
      }`}
    >
      {isRecording ? (
        <div className="w-6 h-6 bg-white rounded-sm" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-red-600" />
      )}
    </button>
  )}

  {/* Right: photo effect selector */}
  <div className="flex items-center gap-2 bg-black/60 rounded-full px-3 py-2 shadow-md">
    {["normal", "grayscale", "blur"].map((effect) => (
      <button
        key={effect}
        onClick={() => setPhotoEffect(effect as any)}
        className={`text-sm font-medium px-3 py-1 rounded-md capitalize transition ${
          photoEffect === effect ? "bg-violet-600 text-white" : "text-gray-200 hover:text-white"
        }`}
      >
        {effect}
      </button>
    ))}
  </div>
</div>

        {/* Recording timer overlay */}
        {isRecording && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-full px-3 py-1 text-red-500 font-mono text-sm flex items-center gap-2 z-40">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            {Math.floor(recordingTime / 60)
              .toString()
              .padStart(2, "0")}
            :
            {(recordingTime % 60).toString().padStart(2, "0")}
          </div>
        )}

      </div>

      {/* Hidden canvas for captures */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}