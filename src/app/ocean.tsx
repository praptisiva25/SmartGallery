"use client";

import React, { useCallback, useMemo, useState } from "react";

type TopLabel = { label: string; p_img: number; p_txt_support: number };
type PredictResponse = {
  effect_top: TopLabel;
  calamity_top: TopLabel;
  avg_top_img_score: number;
  semantic_on_none: {
    triggered: boolean;
    verdict: string;
    p_txt?: Record<string, number>;
    thresholds?: Record<string, number>;
    flag_analyst?: boolean;
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

const pct = (v: number, d = 1) =>
  `${(Math.max(0, Math.min(1, v)) * 100).toFixed(d)}%`;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onFile = useCallback((f: File | null) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setErr(null);
    const url = URL.createObjectURL(f);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f && f.type.startsWith("image/")) onFile(f);
    },
    [onFile]
  );

  const onBrowse = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f && f.type.startsWith("image/")) onFile(f);
    },
    [onFile]
  );

  const canSubmit = useMemo(
    () => !!file && description.trim().length > 0,
    [file, description]
  );

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("description", description);

      const r = await fetch(`${API_BASE}/predict`, { method: "POST", body: fd });
      if (!r.ok) throw new Error(await r.text());
      const json = (await r.json()) as PredictResponse;
      setResult(json);
    } catch (e: any) {
      setErr(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl p-6 sm:p-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Ocean Hazard Verifier
            </h1>
            <p className="text-slate-400 text-sm">
              Directly calls {API_BASE}/predict
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-medium">Input</h2>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="mb-4 flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40"
            >
              <div className="text-center">
                <p className="text-slate-300">Drag & drop an image</p>
                <p className="text-slate-500 text-sm">or</p>
                <label className="mt-2 inline-block cursor-pointer rounded-lg bg-slate-100 px-3 py-1 text-slate-900 hover:bg-white">
                  Browse
                  <input type="file" accept="image/*" className="hidden" onChange={onBrowse} />
                </label>
              </div>
            </div>

            {preview && (
              <div className="mb-4 overflow-hidden rounded-xl border border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="preview"
                  className="max-h-80 w-full object-contain bg-slate-950"
                />
              </div>
            )}

            <label className="mb-1 block text-sm text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., black liquid on beach…"
              className="h-28 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            />

            <div className="mt-5 flex gap-3">
              <button
                onClick={submit}
                disabled={!canSubmit || loading}
                className="rounded-xl bg-cyan-400 px-4 py-2 font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Analyzing…" : "Analyze"}
              </button>
              <button
                onClick={() => {
                  if (preview) URL.revokeObjectURL(preview);
                  setFile(null);
                  setPreview(null);
                  setDescription("");
                  setErr(null);
                  setResult(null);
                }}
                className="rounded-xl bg-slate-800 px-4 py-2 text-slate-200"
              >
                Reset
              </button>
            </div>

            {err && (
              <p className="mt-3 rounded-lg border border-rose-700 bg-rose-900/30 px-3 py-2 text-sm text-rose-200">
                {err}
              </p>
            )}
          </section>

          {/* Results */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-medium">Results</h2>

            {!result ? (
              <p className="text-slate-400">No results yet.</p>
            ) : (
              <div className="space-y-5">
                <Block title="Effect (top-1)">
                  <KV label="Label" value={result.effect_top.label} />
                  <KV label="Image confidence" value={pct(result.effect_top.p_img)} />
                  <KV label="Text support" value={pct(result.effect_top.p_txt_support)} />
                </Block>

                <Block title="Calamity (top-1)">
                  <KV label="Label" value={result.calamity_top.label} />
                  <KV label="Image confidence" value={pct(result.calamity_top.p_img)} />
                  <KV label="Text support" value={pct(result.calamity_top.p_txt_support)} />
                </Block>

                <Block title="Average image confidence">
                  <KV label="Average" value={pct(result.avg_top_img_score)} />
                </Block>

                {result.semantic_on_none?.triggered && (
                  <Block title="Semantic fallback (on 'none')">
                    <KV label="Verdict" value={result.semantic_on_none.verdict} />
                    {result.semantic_on_none.p_txt && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(result.semantic_on_none.p_txt).map(([k, v]) => (
                          <KV key={k} label={`p_txt · ${k}`} value={pct(v)} />
                        ))}
                      </div>
                    )}
                    {result.semantic_on_none.thresholds && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(result.semantic_on_none.thresholds).map(([k, v]) => (
                          <KV key={k} label={`threshold · ${k}`} value={pct(v)} />
                        ))}
                      </div>
                    )}
                    {result.semantic_on_none.flag_analyst && (
                      <div className="mt-3 rounded-lg border border-amber-600 bg-amber-900/20 px-3 py-2 text-amber-200">
                        Needs analyst review
                      </div>
                    )}
                  </Block>
                )}
              </div>
            )}
          </section>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-500">
          One-page frontend — no bars, numeric scores only.
        </footer>
      </div>
    </main>
  );
}

/* -------- Small UI helpers -------- */

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm text-slate-300">{title}</div>
      <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-4">
        {children}
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="rounded-lg bg-slate-800/60 px-2 py-1 text-slate-100">{value}</span>
    </div>
  );
}
