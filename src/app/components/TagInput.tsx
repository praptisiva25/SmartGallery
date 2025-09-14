"use client";

import { useState } from "react";

export default function TagInput({
  value,
  onChange,
  placeholder = "Type a tag and press Enter…",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = (t: string) => {
    const tag = t.trim().toLowerCase();
    if (!tag) return;
    if (value.includes(tag)) return;
    onChange([...value, tag]);
    setDraft("");
  };

  const remove = (t: string) => onChange(value.filter((v) => v !== t));

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {value.map((t) => (
          <span key={t} style={{ fontSize: 12, padding: "6px 10px", border: "1px solid #ddd", borderRadius: 999 }}>
            {t}{" "}
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
            add(draft);
          }
        }}
        placeholder={placeholder}
        style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
      />
    </div>
  );
}
