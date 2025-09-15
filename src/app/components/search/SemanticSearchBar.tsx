"use client";
import { Sparkles, Copy } from "lucide-react";

export default function SemanticSearchBar({
  value,
  onChange,
  onSearch,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}) {
  // This component intentionally does NOT render a search input.
  // It provides helpful examples + quick-copy buttons so users can use
  // the top search bar instead (per your request).

  const examples = [
    'birthday celebration with cousins',
    'beach day: sunset, friends, umbrellas',
    'graduation ceremony with family photos',
    'cat sleeping on the sofa',
    'hiking trip in the Himalayas with backpacks',
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // If you want the app to auto-fill a connected input, you could call onChange(text) here.
      // But we avoid changing other components — keeping this read-only and helpful.
      // Optionally notify user via small toast in your app (not included).
      // quick visual feedback via alert (replace with toast if you have one)
      // alert("Copied to clipboard — paste in the top search bar");
    } catch {
      // fallback
      console.warn("Clipboard write failed.");
    }
  };

  return (
    <div className="w-full rounded-2xl border border-gray-100/40 bg-white/60 backdrop-blur p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Semantic
          </div>
          <div className="text-sm text-gray-600">Use the top search bar for queries — here are helpful examples</div>
        </div>

        <div className="text-xs text-gray-400">Powered by LLMs + Transformers</div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="col-span-1">
          <h3 className="text-md font-semibold text-gray-800">Quick examples</h3>
          <p className="mt-1 text-sm text-gray-500">Tap “Copy” to paste into the top search bar.</p>

          <ul className="mt-3 space-y-2">
            {examples.map((ex) => (
              <li key={ex} className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                <span className="text-sm text-gray-700 truncate">{ex}</span>
                <button
                  onClick={() => copyToClipboard(ex)}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border hover:bg-gray-100 text-sm"
                  aria-label={`Copy example ${ex}`}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-1">
          <h3 className="text-md font-semibold text-gray-800">Tips & filters</h3>
          <div className="mt-2 text-sm text-gray-600 space-y-2">
            <p>• Use natural language: "photos from last summer with friends".</p>
            <p>• Try adding <span className="font-medium">locations</span>, <span className="font-medium">people</span>, or <span className="font-medium">events</span>.</p>
            <p>• Combine tags: <span className="italic">"wedding bride sunset"</span> — the top bar supports quick searches.</p>
            <p>• If you want semantic-only results, prefix with <span className="font-medium">"semantic:"</span> (optional internal convention).</p>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-800">No library items yet?</h4>
            <p className="mt-2 text-sm text-gray-500">
              Add items on the Dashboard. Once you have photos, the top search will return better results.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  // The component does not assume routing helpers are available.
                  // If you have a router helper, replace with router push to dashboard.
                  // Using a fallback: try to open '/dashboard' in same tab.
                  window.location.href = "/dashboard";
                }}
                className="btn inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:opacity-95"
              >
                Go to Dashboard
              </button>

              <button
                onClick={() => copyToClipboard("birthday celebration with cousins")}
                className="inline-flex items-center px-3 py-2 rounded-xl border text-sm"
              >
                Copy sample
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
