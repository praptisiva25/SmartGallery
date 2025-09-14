"use client";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";


export default function TopSearch() {
const [v, setV] = useState("");
const router = useRouter();
return (
<div className="hidden md:flex items-center gap-2 w-full max-w-xl">
<div className="flex-1 flex items-center gap-2 bg-bg-card border border-white/10 rounded-xl px-3 py-2">
<Search className="w-4 h-4 text-fg-muted"/>
<input value={v} onChange={(e)=>setV(e.target.value)} placeholder="Search: 'birthday with cousins'" className="bg-transparent outline-none w-full"/>
</div>
<button onClick={()=> router.push(`/search?q=${encodeURIComponent(v)}`)} className="btn">Search</button>
</div>
);
}