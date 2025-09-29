"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToLibrary } from "@/lib/store";
import type { LibraryItem } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCamera = searchParams.get("fromCamera");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  type Mode = "choose" | "ai" | "manual";
  const [mode, setMode] = useState<Mode>("choose");

  const aiSuggestions = useMemo(
    () => ["beach", "sunset", "friends", "party", "cake", "smile", "outdoor", "travel"],
    []
  );
  const [aiSelected, setAiSelected] = useState<string[]>([]);
  const [manualTags, setManualTags] = useState<string[]>([]);

  // ✅ Load last captured photo if coming from camera
  useEffect(() => {
    if (fromCamera) {
      const savedPhoto = localStorage.getItem("last:capture");
      if (savedPhoto) setPreview(savedPhoto);
    }
  }, [fromCamera]);

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  }, [file]);

  const canSave =
    !!preview &&
    ((mode === "ai" && aiSelected.length > 0) || (mode === "manual" && manualTags.length > 0));

  const onSave = () => {
    const tags = mode === "ai" ? aiSelected : manualTags;
    const item: LibraryItem = {
      id: `lib_${Date.now()}`,
      src: preview,
      tags,
      createdAt: new Date().toISOString(),
      title: file?.name || "Untitled",
    };
    addToLibrary(item);
    router.push("/library");
  };

  return (
    <main className="p-6 grid gap-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>

      {/* 1) pick an image or load from camera */}
      <section className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
        <h3 className="mb-3 text-lg font-medium text-gray-800">1) Select a picture</h3>
        <input
          type="file"
          accept="image/*"
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
            <img
              src={preview}
              alt="preview"
              className="max-w-full rounded-xl border border-gray-200 shadow-sm"
            />
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
              mode === "ai"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            } ${!preview ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            AI Tagging
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            disabled={!preview}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              mode === "manual"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            } ${!preview ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Manual Tagging
          </button>
        </div>

        {mode === "ai" && (
          <div className="grid gap-3">
            <p className="text-sm text-gray-500">
              Suggested tags (demo): click to toggle selections.
            </p>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((t) => {
                const active = aiSelected.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setAiSelected((s) =>
                        s.includes(t) ? s.filter((x) => x !== t) : [...s, t]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {!!aiSelected.length && (
              <div className="text-xs text-gray-500">Selected: {aiSelected.join(", ")}</div>
            )}
          </div>
        )}

        {mode === "manual" && <ManualTagInline value={manualTags} onChange={setManualTags} />}

        {mode === "choose" && (
          <p className="mt-2 text-sm text-gray-500">
            Select a picture first, then pick <b>AI Tagging</b> or <b>Manual Tagging</b>.
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
            canSave
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Save → Library
        </button>
      </section>
    </main>
  );
}

/** tiny inline manual tag input */
function ManualTagInline({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const t = draft.trim().toLowerCase();
    if (!t || value.includes(t)) return;
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
          <span
            key={t}
            style={{
              fontSize: 12,
              padding: "6px 10px",
              border: "1px solid #ddd",
              borderRadius: 999,
            }}
          >
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              style={{
                marginLeft: 6,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                opacity: 0.7,
              }}
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
        placeholder="e.g., beach, birthday, travel…"
        style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
      />
    </div>
  );
}