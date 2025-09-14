"use client";

import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (!item) return;
    setTitle(item.title || "");
    setTags(item.tags || []);
    setPreview(item.src);
  }, [item]);

  if (!item) return null;

  const addTag = () => {
    const t = draft.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setDraft("");
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const onPickNewImage = async (f?: File | null) => {
    const file = f ?? fileRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const onSave = () => {
    updateLibraryItem(item.id, { title, tags, src: preview });
    onChanged();
    onClose();
  };

  const onDelete = () => {
    if (!confirm("Delete this image from your library?")) return;
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

        <div style={{ display: "grid", gap: 12 }}>
          <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 10, border: "1px solid #eee" }} />

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
            <label style={label}>Replace image (optional)</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => onPickNewImage(e.target.files?.[0] || null)} />
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
  );
}

/* styles */
const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 50
};
const sheet: React.CSSProperties = {
  width: "min(720px, 96vw)", maxHeight: "92vh", overflow: "auto",
  background: "white", padding: 16, borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.35)"
};
const input: React.CSSProperties = { padding: 10, borderRadius: 8, border: "1px solid #ddd" };
const label: React.CSSProperties = { fontSize: 12, opacity: 0.8 };
const chip: React.CSSProperties = { fontSize: 12, padding: "6px 10px", border: "1px solid #ddd", borderRadius: 999 };
const chipX: React.CSSProperties = { marginLeft: 6, border: "none", background: "transparent", cursor: "pointer", opacity: 0.7 };
const primaryBtn: React.CSSProperties = { padding: "10px 14px", borderRadius: 8, border: "1px solid #111", background: "#111", color: "white" };
const plainBtn: React.CSSProperties = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", background: "white" };
const dangerBtn: React.CSSProperties = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ef4444", background: "#fee2e2", color: "#991b1b" };
const ghostBtn: React.CSSProperties = { padding: 6, borderRadius: 8, border: "1px solid #eee", background: "white" };
