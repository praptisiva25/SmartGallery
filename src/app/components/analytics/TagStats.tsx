import { mockAllTags } from "@/lib/mockData";


export default function TagStats() {
const items = mockAllTags().slice(0,10);
return (
<div className="space-y-2">
{items.map(t => (
<div key={t.label} className="flex items-center gap-2">
<div className="w-24 text-sm text-fg-muted">{t.label}</div>
<div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
<div className="h-full bg-brand-600" style={{ width: `${Math.min(100, t.count)}%` }} />
</div>
<div className="w-10 text-right text-sm">{t.count}</div>
</div>
))}
</div>
);
}