"use client";

import React, { useMemo, useState } from "react";
import {
  HardDrive,
  Info,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  Folder,
  CheckCircle2,
} from "lucide-react";

// ------------------------------------------------------------
// /storage/page.tsx — Next.js + TypeScript + Tailwind (Frontend Only)
// Static demo (no uploads): shows storage overview with dummy counts
// and Declutter Recommendations with 4 similar images ready to delete.
// ------------------------------------------------------------

// Dummy storage stats
const QUOTA_BYTES = 10 * 1024 ** 3; // 10 GB visual quota
const USED_BYTES = 3.4 * 1024 ** 3; // 3.4 GB used
const STATS = {
  photos: 2145,
  videos: 312,
  albums: 43,
};

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// Pre-seeded "very similar" images (same base photo; variants/resize/grayscale)
const INITIAL_RECS = [
  {
    id: uid("rec"),
    url: "https://picsum.photos/id/237/640/420", // keep (best)
    name: "IMG_237_A.jpg",
    size: 865_000,
  },
  {
    id: uid("rec"),
    url: "https://picsum.photos/id/237/640/420?grayscale",
    name: "IMG_237_B.jpg",
    size: 612_000,
  },
  {
    id: uid("rec"),
    url: "https://picsum.photos/id/237/320/210",
    name: "IMG_237_C.jpg",
    size: 310_000,
  },
  {
    id: uid("rec"),
    url: "https://picsum.photos/id/237/640/420?blur=1",
    name: "IMG_237_D.jpg",
    size: 598_000,
  },
];

export default function StoragePage() {
  const [recs, setRecs] = useState(INITIAL_RECS);
  // Preselect all but the first (we'll keep the highest quality by default)
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(INITIAL_RECS.map((r, i) => [r.id, i !== 0]))
  );

  const usedPct = useMemo(() => Math.min(100, (USED_BYTES / QUOTA_BYTES) * 100), []);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const deleteSelected = () => {
    const ids = new Set(Object.entries(selected).filter(([, v]) => v).map(([k]) => k));
    if (ids.size === 0) return;
    setRecs((prev) => prev.filter((r) => !ids.has(r.id)));
    setSelected((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !ids.has(k))));
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <HardDrive className="w-6 h-6" />
          <h1 className="text-lg font-semibold">Storage</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Overview */}
        <section className="bg-white border rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-semibold">Overview</h2>
            <span className="ml-auto text-sm text-neutral-600">
              {fmtSize(USED_BYTES)} used of {fmtSize(QUOTA_BYTES)}
            </span>
          </div>
          <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-neutral-900" style={{ width: `${usedPct.toFixed(2)}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<ImageIcon className="w-4 h-4" />} label="Photos" value={STATS.photos.toLocaleString()} />
            <StatCard icon={<VideoIcon className="w-4 h-4" />} label="Videos" value={STATS.videos.toLocaleString()} />
            <StatCard icon={<Folder className="w-4 h-4" />} label="Albums" value={STATS.albums.toLocaleString()} />
            <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Duplicates flagged" value={recs.length.toString()} />
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>want more storage? Upgrade.</span>
          </div>
        </section>

        {/* Declutter Recommendations */}
        <section className="bg-white border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold">Declutter Recommendations</h2>
            <span className="text-sm text-neutral-600">We found {recs.length} similar items</span>
          </div>

          {recs.length === 0 ? (
            <div className="rounded-xl border p-4 text-sm text-neutral-600 bg-neutral-50">
              You're all set — no similar photos to clean up right now.
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {recs.map((m, idx) => (
                  <label key={m.id} className="relative block border rounded-lg overflow-hidden group cursor-pointer">
                    <img src={m.url} alt={m.name} className="w-full h-44 object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-black/0 text-white p-2 text-xs">
                      <div className="truncate" title={m.name}>{m.name}</div>
                      <div className="opacity-80">{idx === 0 ? "Best quality (keep)" : "Suggested delete"}</div>
                    </div>
                    <input
                      type="checkbox"
                      className="absolute top-2 left-2 h-4 w-4 rounded border bg-white"
                      checked={!!selected[m.id]}
                      onChange={() => toggle(m.id)}
                    />
                  </label>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-xl border hover:bg-neutral-50"
                  onClick={() => setSelected(Object.fromEntries(recs.map((r, i) => [r.id, i !== 0])))}
                >
                  Select All Suggested
                </button>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-red-600 hover:bg-red-50"
                  onClick={deleteSelected}
                  disabled={Object.values(selected).every((v) => !v)}
                >
                  <Trash2 className="w-4 h-4" /> Delete Selected
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border rounded-xl p-3">
      <div className="shrink-0 rounded-lg border p-2">{icon}</div>
      <div>
        <div className="text-xs text-neutral-500">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}