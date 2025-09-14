"use client";
import { useEffect } from "react";
import { Sparkles, Search } from "lucide-react";


export default function SemanticSearchBar({ value, onChange, onSearch }: { value: string; onChange: (v:string)=>void; onSearch: ()=>void }) {
useEffect(()=>{
const handler = (e: KeyboardEvent) => { if (e.key === 'Enter') onSearch(); };
window.addEventListener('keydown', handler);
return () => window.removeEventListener('keydown', handler);
},[onSearch]);


return (
<div className="card">
<div className="flex items-center gap-3">
<div className="badge"><Sparkles className="w-3 h-3 mr-1"/> Semantic</div>
<div className="text-sm text-fg-muted">Try: "birthday celebration with cousins"</div>
</div>
<div className="mt-3 flex gap-2">
<div className="flex-1 flex items-center gap-2 bg-bg-card border border-white/10 rounded-xl px-3 py-2">
<Search className="w-4 h-4 text-fg-muted"/>
<input value={value} onChange={e=>onChange(e.target.value)} placeholder="Ask in natural language…" className="bg-transparent outline-none w-full"/>
</div>
<button onClick={onSearch} className="btn">Search</button>
</div>
<div className="mt-2 text-xs text-fg-muted">Powered by LLMs + Transformers (replace mock with real API)</div>
</div>
);
}