import Link from "next/link";
import { Album, Home, Library, Search, Settings, ShieldCheck } from "lucide-react";


const items = [
{ href: "/dashboard", label: "Dashboard", icon: Home },
{ href: "/library", label: "Library", icon: Library },
{ href: "/search", label: "Search", icon: Search },
{ href: "/settings", label: "Settings", icon: Settings },
];


export default function SideNav() {
return (
<nav className="space-y-3">
<div className="flex items-center gap-3 mb-4">
<Album className="w-6 h-6 text-brand-400"/>
<div>
<div className="font-semibold leading-tight">SmartGallery</div>
<div className="text-xs text-fg-muted flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> privacy‑first</div>
</div>
</div>


{items.map(({ href, label, icon: Icon }) => (
<Link key={href} href={href} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5">
<Icon className="w-5 h-5"/> <span>{label}</span>
</Link>
))}


<div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10">
<div className="text-sm font-medium mb-1">Auto‑Tagging</div>
<p className="text-xs text-fg-muted">Objects, Scenes, Emotions, OCR. Editable & redactable.</p>
</div>
</nav>
);
}