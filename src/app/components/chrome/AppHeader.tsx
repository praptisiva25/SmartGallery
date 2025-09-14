"use client";
import Link from "next/link";
import TopSearch from "./TopSearch";
import { CircleUserRound } from "lucide-react";


export default function AppHeader() {
return (
<header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-bg/60 border-b border-white/10">
<div className="flex items-center justify-between px-4 py-3">
<Link href="/dashboard" className="font-semibold">SmartGallery</Link>
<TopSearch />
<Link href="/settings" className="badge gap-2"><CircleUserRound className="w-4 h-4"/> Account</Link>
</div>
</header>
);
}