"use client";

import { useEffect, useState } from "react";
import { getLibrary, clearLibrary } from "@/lib/store";
import type { LibraryItem } from "@/lib/types";

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);

  const load = () => setItems(getLibrary());

  useEffect(() => {
    load();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Library</h2>
        <button
          onClick={() => {
            clearLibrary();
            load();
          }}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}
        >
          Clear (demo)
        </button>
      </div>

      {items.length === 0 ? (
        <p style={{ opacity: 0.8 }}>
          No items yet. Go to the Dashboard, select a photo, tag it, and save.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {items.map((it) => (
            <div
              key={it.id}
              style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}
            >
              <img
                src={it.src}
                alt={it.title || "image"}
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }}
              />
              <div style={{ padding: 10 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 6,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {it.title || "Untitled"}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {it.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        border: "1px solid #ddd",
                        borderRadius: 999,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
