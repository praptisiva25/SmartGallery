"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LibraryItem } from "@/lib/types";
import { updateLibraryItem, removeFromLibrary } from "@/lib/store";

export default function MediaEditor({
  item,
  onClose,
  onChanged, // call after save/delete to refresh parent list
}: {
  item: LibraryItem | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [title, setTitle] = useState(item?.title || "");
  const [tags, setTags] = useState<string[]>(item?.tags || []);
  const [preview, setPreview] = useState(item?.src || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");

  // --- AI Tagging ----------------------------------------------------
  const BASE_TAGS = useMemo(
    () => [
      "beach","sunset","friends","party","outdoor","travel","nature","city","mountain","family",
      "dog","cat","food","birthday","concert","selfie","work","funny","sports","summer",
      "winter","night","portrait","landscape","retro","cinematic","minimal","aesthetic","vacation",
      "kids","wedding","festival","hiking","camping","art","museum","car","ocean","lake","river",
      "slowmo","timelapse","vlog","documentary","tutorial","music","drone"
    ],
    []
  );
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiSelected, setAiSelected] = useState<string[]>([]);

  function shuffle<T>(arr: T[]) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function refreshSuggestions() {
    setAiSuggestions(shuffle(BASE_TAGS).slice(0, 12));
    setAiSelected([]);
  }

  // ------------------------------------------------------------------

  useEffect(() => {
    if (!item) return;
    setTitle(item.title || "");
    setTags(item.tags || []);
    setPreview(item.src);
    refreshSuggestions();
  }, [item]);

  if (!item) return null;

  const isVideoSrc = (src: string) =>
    src.startsWith("data:video/") || src.startsWith("blob:") || tags.includes("video");

  const addTag = () => {
    const t = draft.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setDraft("");
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const onPickNewMedia = async (f?: File | null) => {
    const file = f ?? fileRef.current?.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video/")) {
      // For videos, use a blob URL (small string, avoids localStorage quota blowups)
      const blobUrl = URL.createObjectURL(file);
      setPreview(blobUrl);
      // Ensure the "video" tag is present so all views render with <video>
      if (!tags.includes("video")) setTags((prev) => [...prev, "video"]);
    } else {
      // For images, base64 is fine (usually small enough)
      const reader = new FileReader();
      reader.onload = () => setPreview(String(reader.result || ""));
      reader.readAsDataURL(file);
      // Optionally remove "video" tag if present (since we replaced with an image)
      // setTags((prev) => prev.filter((t) => t !== "video"));
    }
  };

  const applySelectedAiTags = () => {
    if (!aiSelected.length) return;
    const merged = Array.from(new Set([...tags, ...aiSelected.map((t) => t.toLowerCase())]));
    setTags(merged);
    setAiSelected([]);
  };

  const onSave = () => {
    updateLibraryItem(item.id, { title, tags, src: preview });
    onChanged();
    onClose();
  };

  const onDelete = () => {
    if (!confirm("Delete this item from your library?")) return;
    removeFromLibrary(item.id);
    onChanged();
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={sheet}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <b>Edit Item</b>
          <button onClick={onClose} style={ghostBtn}>✕</button>
        </div>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
          {/* LEFT: media + title + manual tags */}
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                width: "100%",
                aspectRatio: isVideoSrc(preview) ? "16/9" : "4/3",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #eee",
                background: isVideoSrc(preview) ? "#000" : "#fff",
              }}
            >
              {preview ? (
  isVideoSrc(preview) ? (
    <video
      src={preview}
      controls
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ) : (
    <img
      src={preview}
      alt="preview"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  )
) : (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "grid",
      placeItems: "center",
      fontSize: 12,
      color: "#999",
    }}
  >
    No preview
  </div>
)}

            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={label}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                style={input}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={label}>Tags</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {tags.map((t) => (
                  <span key={t} style={chip}>
                    {t}
                    <button onClick={() => removeTag(t)} style={chipX} aria-label={`remove ${t}`}>×</button>
                  </span>
                ))}
              </div>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type a tag and press Enter…"
                style={input}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={label}>Replace media (optional)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => onPickNewMedia(e.target.files?.[0] || null)}
              />
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Tip: replacing with a <b>video</b> uses a temporary blob URL (lighter on storage).
              </div>
            </div>
          </div>

          {/* RIGHT: AI Tagging + actions */}
          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>AI Tagging (random suggestions)</div>
                <button onClick={refreshSuggestions} style={smallBtn}>Shuffle</button>
              </div>
              <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
                Click tags to toggle, then add them to this item.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {aiSuggestions.map((t) => {
                  const on = aiSelected.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() =>
                        setAiSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))
                      }
                      style={{
                        fontSize: 12,
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: `1px solid ${on ? "#4f46e5" : "#ddd"}`,
                        background: on ? "#eef2ff" : "white",
                        color: on ? "#3730a3" : "#333",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button
                  onClick={applySelectedAiTags}
                  disabled={aiSelected.length === 0}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #111",
                    background: aiSelected.length === 0 ? "#f2f2f2" : "#111",
                    color: aiSelected.length === 0 ? "#999" : "#fff",
                    cursor: aiSelected.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Add selected
                </button>
                {aiSelected.length > 0 && (
                  <button
                    onClick={() => setAiSelected([])}
                    style={plainBtn}
                  >
                    Clear picks
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <button onClick={onDelete} style={dangerBtn}>Delete</button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onClose} style={plainBtn}>Cancel</button>
                <button onClick={onSave} style={primaryBtn}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* styles */
const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 50
};
const sheet: React.CSSProperties = {
  width: "min(920px, 96vw)", maxHeight: "92vh", overflow: "auto",
  background: "white", padding: 16, borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.35)"
};
const input: React.CSSProperties = { padding: 10, borderRadius: 8, border: "1px solid #ddd" };
const label: React.CSSProperties = { fontSize: 12, opacity: 0.8 };
const chip: React.CSSProperties = { fontSize: 12, padding: "6px 10px", border: "1px solid #ddd", borderRadius: 999 };
const chipX: React.CSSProperties = { marginLeft: 6, border: "none", background: "transparent", cursor: "pointer", opacity: 0.7 };
const primaryBtn: React.CSSProperties = { padding: "10px 14px", borderRadius: 8, border: "1px solid #111", background: "#111", color: "white" };
const plainBtn: React.CSSProperties = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", background: "white" };
const smallBtn: React.CSSProperties = { padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "white" };
const dangerBtn: React.CSSProperties = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ef4444", background: "#fee2e2", color: "#991b1b" };
const ghostBtn: React.CSSProperties = { padding: 6, borderRadius: 8, border: "1px solid #eee", background: "white" };
