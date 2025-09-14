"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addToLibrary } from "@/lib/store";
import type { LibraryItem } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();

  
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

  
  useEffect(() => {
    if (!file) { setPreview(""); return; }
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
    <main style={{ padding: 24, display: "grid", gap: 16, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Dashboard</h2>

      {/* 1) pick an image */}
      <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginBottom: 10 }}>1) Select a picture</h3>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        {preview && (
          <div style={{ marginTop: 12 }}>
            <img src={preview} alt="preview" style={{ maxWidth: "100%", borderRadius: 10, border: "1px solid #eee" }} />
          </div>
        )}
      </section>

      
      <section style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginBottom: 10 }}>2) Choose tagging</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setMode("ai")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: mode === "ai" ? "#111" : "white",
              color: mode === "ai" ? "white" : "black",
            }}
            disabled={!preview}
          >
            AI Tagging
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: mode === "manual" ? "#111" : "white",
              color: mode === "manual" ? "white" : "black",
            }}
            disabled={!preview}
          >
            Manual Tagging
          </button>
        </div>

        
        {mode === "ai" && (
          <div style={{ display: "grid", gap: 10 }}>
            <p style={{ opacity: 0.8, margin: 0 }}>Suggested tags (demo): click to toggle selections.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {aiSuggestions.map((t) => {
                const active = aiSelected.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setAiSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #ddd",
                      background: active ? "#111" : "white",
                      color: active ? "white" : "black",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            {!!aiSelected.length && (
              <div style={{ fontSize: 12, opacity: 0.8 }}>Selected: {aiSelected.join(", ")}</div>
            )}
          </div>
        )}

        
        {mode === "manual" && <ManualTagInline value={manualTags} onChange={setManualTags} />}

        {mode === "choose" && (
          <p style={{ marginTop: 6, fontSize: 14, opacity: 0.8 }}>
            Select a picture first, then pick <b>AI Tagging</b> or <b>Manual Tagging</b>.
          </p>
        )}
      </section>

    
      <section style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: canSave ? "#111" : "#f3f4f6",
            color: canSave ? "white" : "#999",
            cursor: canSave ? "pointer" : "not-allowed",
          }}
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
          if (e.key === "Enter") { e.preventDefault(); add(); }
        }}
        placeholder="e.g., beach, cousins, birthday…"
        style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
      />
    </div>
  );
}
