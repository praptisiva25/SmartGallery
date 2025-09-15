"use client";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export default function TopSearch() {
  const [v, setV] = useState("");
  const router = useRouter();

  return (
    <div className="hidden md:flex items-center gap-2 w-full max-w-xl">
      <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="Search: 'birthday with cousins'"
          className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
        />
      </div>
      <button
        onClick={() => router.push(`/search?q=${encodeURIComponent(v)}`)}
        className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
      >
        Search
      </button>
    </div>
  );
}
