"use client";
import { BadgePlus } from "lucide-react";
import type { MediaItem } from "@/lib/types";


export default function MediaItemCard({ item, onOpen }: { item: MediaItem; onOpen: ()=>void }) {
return (
<button className="relative group rounded-2xl overflow-hidden border border-white/10" onClick={onOpen}>
<img src={item.thumbUrl} alt={item.title} className="w-full aspect-[4/3] object-cover"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition"/>
<div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
<div className="text-left">
<div className="text-sm font-medium drop-shadow">{item.title}</div>
<div className="text-[11px] text-white/80 drop-shadow">{item.tags.slice(0,3).join(" • ")}</div>
</div>
<div className="badge bg-black/40 border-white/20">
<BadgePlus className="w-3 h-3 mr-1"/> tags
</div>
</div>
</button>
);
}