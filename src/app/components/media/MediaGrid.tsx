import  MediaItemCard  from "./MediaItemCard";
import type { MediaItem } from "@/lib/types";


export default function MediaGrid({ items, onOpen }: { items: MediaItem[]; onOpen: (m: MediaItem)=>void }) {
return (
<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
{items.map(m => (
<MediaItemCard key={m.id} item={m} onOpen={() => onOpen(m)} />
))}
</div>
);
}