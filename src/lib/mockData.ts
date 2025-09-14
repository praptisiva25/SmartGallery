import type { MediaItem } from "@/lib/types";


export const mockMedia: MediaItem[] = [
{
id: "m1",
title: "Goa trip beach",
thumbUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
tags: ["beach","friends","sunset"],
auto: {
objectTags: ["person","umbrella","sea"],
sceneTags: ["beach","outdoor","sunset"],
emotionTags: ["smiling"],
ocr: ["GOA", "Beach Shack", "2024"]
}
},
{
id: "m2",
title: "Birthday with cousins",
thumbUrl: "https://images.unsplash.com/photo-1604014237800-1c9102c0a9b3?q=80&w=1200&auto=format&fit=crop",
tags: ["birthday","cake","family"],
auto: {
objectTags: ["cake","candle","balloons"],
sceneTags: ["indoor","party"],
emotionTags: ["happy","surprised"],
ocr: ["Happy Birthday", "12"]
}
},
{
id: "m3",
title: "Convocation day",
thumbUrl: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop",
tags: ["graduation","friends","smile"],
auto: {
objectTags: ["gown","cap","person"],
sceneTags: ["campus","outdoor"],
emotionTags: ["proud","smiling"],
ocr: ["VIT", "2025"]
}
}
];


export function mockAllTags() {
const map = new Map<string, number>();
for (const m of mockMedia) for (const t of m.tags) map.set(t, (map.get(t)||0)+1);
return Array.from(map, ([label, count]) => ({ label, count }));
}


// naive semantic match over mock data
export function semanticSearch(q: string) {
if (!q.trim()) return mockMedia;
const qs = q.toLowerCase();
return mockMedia.filter(m => {
const hay = [m.title, ...m.tags, ...m.auto.objectTags, ...m.auto.sceneTags, ...m.auto.emotionTags, ...m.auto.ocr].join(" ").toLowerCase();
// simple token inclusion; replace with vector search later
return qs.split(/\s+/).every(tok => hay.includes(tok));
});
}