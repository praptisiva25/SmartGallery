"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getLibrary } from "@/lib/store";
import type { LibraryItem } from "@/lib/types";
import MediaEditor from "../../components/MediaEditor";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [all, setAll] = useState<LibraryItem[]>([]);
  const [query, setQuery] = useState<string>(searchParams.get("q") ?? "");
  const [active, setActive] = useState<LibraryItem | null>(null);

  
  const load = () => setAll(getLibrary());
  useEffect(() => { load(); }, []);

 
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const results = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return all;

    const tokens = q.split(/[,\s]+/).filter(Boolean);
    return all.filter((it) => {
      const hay = `${it.title ?? ""} ${it.tags.join(" ")}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }, [all, query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = query.trim();
    router.replace(`/search?q=${encodeURIComponent(next)}`);
  };

  const clearQuery = () => {
    setQuery("");
    router.replace(`/search`);
  };

  return (
    <main style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Search</h2>

      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by tags or title (e.g., beach cousins)"
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#111", color: "white" }}>
          Search
        </button>
        <button type="button" onClick={clearQuery} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", background: "white" }}>
          Clear
        </button>
      </form>

      {all.length === 0 ? (
        <p style={{ opacity: 0.8 }}>No items in your library yet. Go to the Dashboard, add one, then search here.</p>
      ) : results.length === 0 ? (
        <p style={{ opacity: 0.8 }}>
          No matches for <b>{query}</b>. Try different tags.
        </p>
      ) : (
        <>
          <p style={{ opacity: 0.8, marginBottom: 10 }}>
            Showing {results.length} of {all.length} items
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {results.map((it) => (
              <button
                key={it.id}
                onClick={() => setActive(it)}
                style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden", padding: 0, textAlign: "left", background: "white", cursor: "pointer" }}
              >
                <img src={it.src} alt={it.title || "image"} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {it.title || "Untitled"}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {it.tags.map((t) => (
                      <span key={t} style={{ fontSize: 12, padding: "4px 8px", border: "1px solid #ddd", borderRadius: 999 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <MediaEditor
        item={active}
        onClose={() => setActive(null)}
        onChanged={() => {
          load(); 
        }}
      />
    </main>
  );
}
