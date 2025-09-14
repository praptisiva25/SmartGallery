"use client";
import { X, Eraser, EyeOff, Save } from "lucide-react";
import type { MediaItem } from "@/lib/types";


export default function TagEditorSheet({ item, onClose }: { item: MediaItem | null; onClose: ()=>void }) {
if (!item) return null;
const groups: { label: string; items: string[] }[] = [
{ label: "Objects", items: item.auto.objectTags },
{ label: "Scenes", items: item.auto.sceneTags },
{ label: "Emotions", items: item.auto.emotionTags },
{ label: "OCR Text", items: item.auto.ocr.slice(0,6) },
];


return (
<div className="fixed inset-0 z-50 bg-black/60">
<div className="absolute right-0 top-0 h-full w-full sm:w-[540px] bg-bg-card border-l border-white/10 p-5 overflow-y-auto">
<div className="flex items-center justify-between mb-4">
<div>
<div className="text-sm text-fg-muted">Tag Editor</div>
<div className="text-lg font-medium">{item.title}</div>
</div>
<button className="badge" onClick={onClose}><X className="w-4 h-4"/> Close</button>
</div>


<img src={item.thumbUrl} alt="preview" className="w-full rounded-xl mb-4"/>


{groups.map(g => (
<div key={g.label} className="mb-5">
<div className="text-xs uppercase tracking-wider text-fg-muted mb-2">{g.label}</div>
<div className="flex flex-wrap gap-2">
{g.items.map(t => (
<span key={t} className="badge">
{t}
<button className="ml-2 opacity-80 hover:opacity-100" title="redact tag"><EyeOff className="w-3 h-3"/></button>
<button className="ml-1 opacity-80 hover:opacity-100" title="remove tag"><Eraser className="w-3 h-3"/></button>
</span>
))}
</div>
</div>
))}


<div className="mt-6 flex justify-end gap-2">
<button className="badge">Reset</button>
<button className="btn"><Save className="w-4 h-4 mr-2"/> Save changes</button>
</div>
</div>
</div>
);
}