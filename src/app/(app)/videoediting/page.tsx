"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Film, Upload, Wand2, Settings2, Sparkles, Play, Pause, Crop, Gauge, Undo2,
  Save as SaveIcon, Video,
} from "lucide-react";
import { addToLibrary } from "@/lib/store";
import type { LibraryItem } from "@/lib/types";
import { useRouter } from "next/navigation";

type FilterLighting = "none" | "retro" | "cinematic" | "cool";
type TabKey = "filters" | "crop" | "speed";
type AIStep = { label: string; do: () => void };

export default function VideoEditingPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // NEW: a persistent file input ref for replace
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // keep original file for saving
  const [fileObj, setFileObj] = useState<File | null>(null);

  // video state
  const [src, setSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  // UI state
  const [activeTab, setActiveTab] = useState<TabKey>("filters");
  const [prompt, setPrompt] = useState("");
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [aiSteps, setAiSteps] = useState<AIStep[]>([]);
  const [showCoach, setShowCoach] = useState(false);

  // Filters (Lighting)
  const [lighting, setLighting] = useState<FilterLighting>("none");
  const [intensity, setIntensity] = useState<number>(60);

  // Crop (simulated)
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [aspect, setAspect] = useState<string>("16:9");

  // Toast
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachMsg, setCoachMsg] = useState("");

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (src?.startsWith("blob:")) URL.revokeObjectURL(src);
    };
  }, [src]);

  // listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => setDuration(v.duration || 0);
    const onTime = () => setCurrentTime(v.currentTime || 0);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // file choose
  const onChooseFile = (file: File) => {
    // revoke previous blob to avoid leaks
    if (src?.startsWith("blob:")) URL.revokeObjectURL(src);

    const url = URL.createObjectURL(file);
    setFileObj(file);
    setSrc(url);
    setIsPlaying(false);
    setLighting("none");
    setIntensity(60);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setAspect("16:9");
    setPlaybackRate(1);
    setPrompt("");
    setAiTips([]);
    setAiSteps([]);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onChooseFile(f);
    // IMPORTANT: allow selecting the same file again later
    e.target.value = "";
  };

  const openPicker = () => fileInputRef.current?.click();

  // styles
  const filterStyle = useMemo(() => {
    const k = intensity / 100;
    if (lighting === "retro") return `hue-rotate(${30 * k}deg) sepia(${0.3 * k}) saturate(${1 + 0.2 * k})`;
    if (lighting === "cinematic") return `contrast(${1.1 + 0.3 * k}) saturate(${1 - 0.2 * k}) brightness(${0.98 - 0.08 * k})`;
    if (lighting === "cool") return `hue-rotate(${-15 * k}deg) contrast(${1.05 + 0.2 * k}) saturate(1.1)`;
    return "none";
  }, [lighting, intensity]);

  const cropWrapperClass = useMemo(() => {
    const map: Record<string, string> = {
      "16:9": "pt-[56.25%]", "1:1": "pt-[100%]", "9:16": "pt-[177.77%]", "4:3": "pt-[75%]",
    };
    return map[aspect] || map["16:9"];
  }, [aspect]);

  const videoTransform = useMemo(() => {
    const tx = offsetX / 100;
    const ty = offsetY / 100;
    return `translate(${tx * 10}%, ${ty * 10}%) scale(${zoom})`;
  }, [zoom, offsetX, offsetY]);

  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) { v.pause(); setIsPlaying(false); }
    else { await v.play(); setIsPlaying(true); }
  };

  const seek = (t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(t, duration));
  };

  // AI mock
  const runAI = () => {
    const p = prompt.toLowerCase();
    const tips: string[] = [];
    const steps: AIStep[] = [];
    const goFiltersRetro = () => {
      setActiveTab("filters");
      setTimeout(() => { setLighting("retro"); setIntensity(70); flashCoach("Applied Retro lighting"); }, 150);
    };
    if (/(retro|vintage).*light|retro(\s|-)look|old\s*film/.test(p)) {
      tips.push("Filters → Lighting → Retro. Adjust intensity.");
      steps.push({ label: "Apply Retro Lighting automatically", do: goFiltersRetro });
    }
    if (/(crop|frame|resize).*(square|1:1|instagram)/.test(p)) {
      tips.push("Crop → 1:1 for square.");
      steps.push({ label: "Set Crop to 1:1 and slight zoom", do: () => {
        setActiveTab("crop");
        setTimeout(() => { setAspect("1:1"); setZoom(1.1); setOffsetX(0); setOffsetY(-5); flashCoach("Cropped to 1:1"); }, 150);
      }});
    }
    if (/(speed|faster|time-lapse|timelapse|hyperlapse)/.test(p)) {
      tips.push("Speed → increase to 1.5× or 2×.");
      steps.push({ label: "Speed up to 1.5×", do: () => {
        setActiveTab("speed");
        setTimeout(() => { setPlaybackRate(1.5); flashCoach("Playback 1.5×"); }, 150);
      }});
    }
    setAiTips(tips.length ? tips : ["Try: ‘retro lighting’, ‘crop to square’, ‘speed up video’."]);
    setAiSteps(steps);
    setShowCoach(true);
  };

  const flashCoach = (msg: string) => {
    setCoachMsg(msg);
    setCoachOpen(true);
    setTimeout(() => setCoachOpen(false), 1600);
  };

  // SAVE (kept as data URL per your current store; consider switching to IndexedDB if quota hits)
  async function saveToLibrary() {
    if (!fileObj) { flashCoach("Choose a video first"); return; }
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ""));
      r.onerror = reject;
      r.readAsDataURL(fileObj);
    });
    const item: LibraryItem = {
      id: `lib_${Date.now()}`,
      src: dataUrl,
      title: fileObj.name || "Untitled",
      createdAt: new Date().toISOString(),
      tags: ["video"],
    };
    addToLibrary(item);
    flashCoach("Saved to Library");
  }

  const fmt = (t: number) => {
    const m = Math.floor(t / 60).toString().padStart(2, "0");
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Film className="w-6 h-6" />
          <h1 className="text-lg font-semibold">AI-Powered Video Editing</h1>

          <div className="ml-auto flex items-center gap-2">
            {/* ALWAYS-VISIBLE: Choose / Replace Video */}
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border hover:bg-neutral-100"
              onClick={openPicker}
              title={src ? "Replace video" : "Choose video"}
            >
              <Upload className="w-4 h-4" />
              {src ? "Replace Video" : "Choose Video"}
            </button>
            {/* Hidden input tied to the button above */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFile}
            />

            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border hover:bg-neutral-100"
              onClick={() => {
                setLighting("none"); setIntensity(60); setZoom(1);
                setOffsetX(0); setOffsetY(0); setAspect("16:9"); setPlaybackRate(1);
                setPrompt(""); setAiTips([]); setAiSteps([]); setShowCoach(false);
                setCurrentTime(0); if (videoRef.current) videoRef.current.currentTime = 0;
                flashCoach("Reset all settings");
              }}
            >
              <Undo2 className="w-4 h-4" /> Reset
            </button>

            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
              onClick={saveToLibrary}
              disabled={!fileObj}
              title={!fileObj ? "Choose a video first" : "Save to Library"}
            >
              <SaveIcon className="w-4 h-4" />
              Save to Library
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Left: Player & prompt */}
        <section className="col-span-12 lg:col-span-8">
          {!src ? (
            <div className="border-2 border-dashed border-neutral-300 rounded-2xl bg-white p-10 text-center">
              <Upload className="w-10 h-10 mx-auto mb-3" />
              <p className="font-medium">Drop a video or choose a file</p>
              <p className="text-sm text-neutral-500">MP4 / WebM recommended. Runs fully in your browser.</p>
              {/* This label remains for first-time selection; later use header button */}
              <label className="inline-block mt-4 px-4 py-2 rounded-xl border cursor-pointer hover:bg-neutral-50">
                <input type="file" accept="video/*" className="hidden" onChange={handleFile} />
                Choose File
              </label>
            </div>
          ) : (
            <>
              {/* Player container with crop/aspect wrapper */}
              <div className={`relative rounded-2xl bg-black overflow-hidden ${cropWrapperClass}`}>
                <div className="absolute inset-0" ref={containerRef}>
                  <video
                    ref={videoRef}
                    src={src}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain w-full h-full"
                    style={{ filter: filterStyle, transform: videoTransform }}
                    onClick={togglePlay}
                    controls
                  />
                </div>
                <div className="absolute left-3 bottom-3 bg-white/90 rounded-full shadow flex items-center gap-2 px-3 py-1.5">
                  <button className="p-1 rounded-full hover:bg-neutral-100" onClick={togglePlay}>
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <span className="text-xs tabular-nums">
                    {fmt(currentTime)} / {fmt(duration)}
                  </span>
                </div>
              </div>

              {/* Scrubber */}
              <div className="mt-3 bg-white border rounded-2xl p-3">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.01}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Prompt → AI coach */}
              <div className="mt-4 bg-white border rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 className="w-5 h-5" />
                  <h3 className="font-semibold">Ask the editor what you want</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., make it look retro with warm lighting"
                    className="flex-1 px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-neutral-300"
                  />
                  <button
                    onClick={runAI}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-neutral-900 text-white hover:bg-neutral-800"
                  >
                    <Sparkles className="w-4 h-4" /> Suggest
                  </button>
                </div>

                {showCoach && (
                  <div className="mt-3 grid md:grid-cols-2 gap-3">
                    <div className="border rounded-2xl p-3">
                      <p className="text-sm font-medium mb-2">Guided steps</p>
                      {aiSteps.length ? (
                        <ul className="space-y-2">
                          {aiSteps.map((s, i) => (
                            <li key={i}>
                              <button
                                className="w-full text-left px-3 py-2 rounded-lg border hover:bg-neutral-50"
                                onClick={s.do}
                              >
                                {s.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-neutral-500">No quick actions available.</p>
                      )}
                    </div>
                    <div className="border rounded-2xl p-3">
                      <p className="text-sm font-medium mb-2">Tips</p>
                      <ul className="list-disc list-inside text-sm text-neutral-700 space-y-1">
                        {aiTips.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* Right: Settings */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              <h3 className="font-semibold">Video Settings</h3>
            </div>

            <div className="px-2 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <TabButton active={activeTab === "filters"} onClick={() => setActiveTab("filters")} icon={<Wand2 className="w-4 h-4" />} label="Filters" />
                <TabButton active={activeTab === "crop"} onClick={() => setActiveTab("crop")} icon={<Crop className="w-4 h-4" />} label="Crop" />
                <TabButton active={activeTab === "speed"} onClick={() => setActiveTab("speed")} icon={<Gauge className="w-4 h-4" />} label="Speed" />
              </div>
            </div>

            {activeTab === "filters" && (
              <div className="p-4 space-y-4">
                <SectionTitle icon={<Video className="w-4 h-4" />} title="Lighting" />
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard label="None" active={lighting === "none"} onClick={() => setLighting("none")} />
                  <ChoiceCard label="Retro" active={lighting === "retro"} onClick={() => setLighting("retro")} />
                  <ChoiceCard label="Cinematic" active={lighting === "cinematic"} onClick={() => setLighting("cinematic")} />
                  <ChoiceCard label="Cool" active={lighting === "cool"} onClick={() => setLighting("cool")} />
                </div>
                <SliderRow label="Intensity" value={intensity} min={0} max={100} step={1} onChange={setIntensity} />
              </div>
            )}

            {activeTab === "crop" && (
              <div className="p-4 space-y-4">
                <SectionTitle icon={<Crop className="w-4 h-4" />} title="Frame" />
                <div className="grid grid-cols-4 gap-2">
                  {(["16:9", "1:1", "9:16", "4:3"] as const).map((a) => (
                    <ChoiceCard key={a} label={a} active={aspect === a} onClick={() => setAspect(a)} />
                  ))}
                </div>
                <SliderRow label="Zoom" value={zoom} min={1} max={2} step={0.01} onChange={setZoom} />
                <SliderRow label="Offset X" value={offsetX} min={-50} max={50} step={1} onChange={setOffsetX} />
                <SliderRow label="Offset Y" value={offsetY} min={-50} max={50} step={1} onChange={setOffsetY} />
              </div>
            )}

            {activeTab === "speed" && (
              <div className="p-4 space-y-4">
                <SectionTitle icon={<Gauge className="w-4 h-4" />} title="Playback" />
                <SliderRow label={`Rate: ${playbackRate.toFixed(2)}×`} value={playbackRate} min={0.25} max={2} step={0.01} onChange={setPlaybackRate} />
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1, 1.5, 2].map((r) => (
                    <ChoiceCard key={r} label={`${r}×`} active={Math.abs(playbackRate - r) < 0.001} onClick={() => setPlaybackRate(r)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Toast */}
      <div className={`fixed left-1/2 -translate-x-1/2 bottom-6 transition-all ${coachOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <div className="bg-neutral-900 text-white px-4 py-2 rounded-xl shadow-lg text-sm">{coachMsg}</div>
      </div>
    </div>
  );
}

// Small components
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm ${
        active ? "bg-neutral-900 text-white border-neutral-900" : "bg-white hover:bg-neutral-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-semibold">{title}</span>
    </div>
  );
}
function ChoiceCard({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl border text-sm ${active ? "bg-neutral-900 text-white border-neutral-900" : "hover:bg-neutral-50"}`}
    >
      {label}
    </button>
  );
}
function SliderRow<T extends number>({ label, value, min, max, step, onChange }: { label: string; value: T; min: number; max: number; step: number; onChange: (v: T) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-neutral-500">{typeof value === "number" ? value.toFixed(2).replace(/\.00$/, "") : String(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) as T)}
        className="w-full"
      />
    </div>
  );
}
