"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToLibrary } from "@/lib/store";
import type { LibraryItem } from "@/lib/types";

type EditorEdits = {
  lighting: "none" | "retro" | "cinematic" | "cool";
  intensity: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  aspect: "16:9" | "1:1" | "9:16" | "4:3" | string;
  playbackRate: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const params = useSearchParams();

  // Can be image or video
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [mime, setMime] = useState<string>("");
  const [fileTitle, setFileTitle] = useState<string>("Untitled");

  // Edits coming from editor (optional)
  const [edits, setEdits] = useState<EditorEdits | null>(null);

  // Modes
  type Mode = "choose" | "ai" | "manual";
  const [mode, setMode] = useState<Mode>("choose");

  // Demo AI suggestions
  const aiSuggestions = useMemo(() => ["beach", "sunset", "friends", "party", "cake", "smile", "outdoor", "travel"], []);
  const [aiSelected, setAiSelected] = useState<string[]>([]);
  const [manualTags, setManualTags] = useState<string[]>([]);

  // If user came from editor with a stashed item, autoload it
  useEffect(() => {
    const hinted = params.get("from")?.startsWith("editor");
    if (!hinted || preview) return;

    try {
      const raw = sessionStorage.getItem("SG_LAST_UPLOAD");
      if (!raw) return;
      const payload = JSON.parse(raw) as {
        kind: "video" | "image";
        src: string;
        name?: string;
        type?: string;
        ts?: number;
        edits?: EditorEdits;
      };

      if (payload && payload.src) {
        setPreview(payload.src);
        setMime(payload.type || (payload.kind === "video" ? "video/mp4" : "image/png"));
        setFileTitle(payload.name || "Untitled");
        if (payload.edits) setEdits(payload.edits);
        // Jump straight into tagging
        setMode("ai");
      }
    } catch {
      /* ignore */
    }
  }, [params, preview]);

  // When a file is selected manually here
  useEffect(() => {
    if (!file) {
      setPreview("");
      setMime("");
      setFileTitle("Untitled");
      setEdits(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
    setMime(file.type || "");
    setFileTitle(file.name || "Untitled");
  }, [file]);

  const canSave =
    !!preview && ((mode === "ai" && aiSelected.length > 0) || (mode === "manual" && manualTags.length > 0));

  const onSave = () => {
    const tags = mode === "ai" ? aiSelected : manualTags;
    const item: LibraryItem = {
      id: `lib_${Date.now()}`,
      src: preview,
      tags,
      createdAt: new Date().toISOString(),
      title: fileTitle,
      // If your LibraryItem supports persisting edits/mime, add them here:
      // mime,
      // edits,
    };
    addToLibrary(item);
    router.push("/library");
  };

  const isVideo = useMemo(() => {
    if (mime) return mime.startsWith("video/");
    if (preview.startsWith("data:video/")) return true;
    if (preview.startsWith("data:image/")) return false;
    return false;
  }, [mime, preview]);

  // Apply SAME visual look as the editor (non-destructive preview)
  const filterStyle = useMemo(() => {
    if (!edits) return undefined;
    const { lighting, intensity } = edits;
    const k = (edits.intensity ?? 60) / 100;
    if (lighting === "retro") return `hue-rotate(${30 * k}deg) sepia(${0.3 * k}) saturate(${1 + 0.2 * k})`;
    if (lighting === "cinematic") return `contrast(${1.1 + 0.3 * k}) saturate(${1 - 0.2 * k}) brightness(${0.98 - 0.08 * k})`;
    if (lighting === "cool") return `hue-rotate(${-15 * k}deg) contrast(${1.05 + 0.2 * k}) saturate(1.1)`;
    return "none";
  }, [edits]);

  const cropWrapperClass = useMemo(() => {
    const a = edits?.aspect;
    const map: Record<string, string> = {
      "16:9": "pt-[56.25%]",
      "1:1": "pt-[100%]",
      "9:16": "pt-[177.77%]",
      "4:3": "pt-[75%]",
    };
    return a ? map[a] || map["16:9"] : "";
  }, [edits?.aspect]);

  const videoTransform = useMemo(() => {
    if (!edits) return undefined;
    const tx = (edits.offsetX ?? 0) / 100;
    const ty = (edits.offsetY ?? 0) / 100;
    return `translate(${tx * 10}%, ${ty * 10}%) scale(${edits.zoom ?? 1})`;
  }, [edits]);

  // set playbackRate on mount if present
  useEffect(() => {
    if (!edits) return;
    const el = document.getElementById("dash-video") as HTMLVideoElement | null;
    if (el && typeof edits.playbackRate === "number") {
      el.playbackRate = edits.playbackRate;
    }
  }, [edits, preview]);

  return (
    <main className="p-6 grid gap-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>

      {/* 1) auto-loaded media from editor OR pick new */}
      <section className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
        <h3 className="mb-3 text-lg font-medium text-gray-800">1) Select a picture or video</h3>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-600
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100 cursor-pointer"
        />

        {preview && (
          <div className="mt-4">
            {/* If we have edits AND it is a video, wrap with aspect like in editor */}
            {isVideo ? (
              edits ? (
                <div className={`relative rounded-xl overflow-hidden border border-gray-200 shadow-sm ${cropWrapperClass || ""}`}>
                  <video
                    id="dash-video"
                    src={preview}
                    controls
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain w-full h-full"
                    style={{ filter: filterStyle, transform: videoTransform }}
                  />
                </div>
              ) : (
                <video src={preview} controls className="max-w-full rounded-xl border border-gray-200 shadow-sm" />
              )
            ) : (
              <img src={preview} alt="preview" className="max-w-full rounded-xl border border-gray-200 shadow-sm" />
            )}
            <p className="mt-2 text-xs text-gray-500">File: {fileTitle}</p>
          </div>
        )}
      </section>

      {/* 2) choose tagging */}
      <section className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
        <h3 className="mb-3 text-lg font-medium text-gray-800">2) Choose tagging</h3>
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => setMode("ai")}
            disabled={!preview}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              mode === "ai" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            } ${!preview ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            AI Tagging
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            disabled={!preview}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              mode === "manual" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            } ${!preview ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Manual Tagging
          </button>
        </div>

        {/* AI Tags */}
        {mode === "ai" && (
          <div className="grid gap-3">
            <p className="text-sm text-gray-500">Suggested tags (demo): click to toggle selections.</p>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((t) => {
                const active = aiSelected.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAiSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                      active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {!!aiSelected.length && <div className="text-xs text-gray-500">Selected: {aiSelected.join(", ")}</div>}
          </div>
        )}

        {/* Manual Tags */}
        {mode === "manual" && <ManualTagInline value={manualTags} onChange={setManualTags} />}

        {mode === "choose" && (
          <p className="mt-2 text-sm text-gray-500">
            Select a file first, then pick <b>AI Tagging</b> or <b>Manual Tagging</b>.
          </p>
        )}
      </section>

      {/* Save Button */}
      <section className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className={`px-5 py-2 rounded-lg font-medium transition ${
            canSave ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Save → Library
        </button>
      </section>
    </main>
  );
}

/** tiny inline manual tag input */
function ManualTagInline({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim().toLowerCase();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  };
  const remove = (t: string) => onChange(value.filter((x) => x !== t));
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <p style={{ opacity: 0.8, margin: 0 }}>
        Manual: type a tag and press <b>Enter</b>.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {value.map((t) => (
          <span key={t} style={{ fontSize: 12, padding: "6px 10px", border: "1px solid #ddd", borderRadius: 999 }}>
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              style={{ marginLeft: 6, border: "none", background: "transparent", cursor: "pointer", opacity: 0.7 }}
              aria-label={`remove ${t}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder="e.g., beach, cousins, birthday…"
        style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
      />
    </div>
  );
}
