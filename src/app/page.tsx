import Link from "next/link";
import { Images, Shield, SearchCheck, Sparkles } from "lucide-react";


export default function Landing() {
return (
<main className="min-h-[100dvh] flex flex-col">
<header className="flex items-center justify-between p-6">
<div className="flex items-center gap-3">
<Images className="w-7 h-7 text-brand-400" />
<span className="font-semibold text-lg">SmartGallery</span>
</div>
<nav className="flex items-center gap-4">
<Link className="link" href="/auth/sign-in">Sign in</Link>
<Link className="btn" href="/auth/sign-up">Get Started</Link>
</nav>
</header>


<section className="flex-1 grid place-items-center px-6">
<div className="max-w-4xl text-center space-y-6">
<h1 className="text-5xl font-semibold tracking-tight">
Your private, AI‑powered photo library
</h1>
<p className="text-fg-muted text-lg">
Automatic tagging, scene & emotion understanding, OCR text capture, and natural‑language search. Own your memories—search like you think.
</p>
<div className="flex items-center justify-center gap-4">
<Link href="/auth/sign-up" className="btn">Create account</Link>
<Link href="/auth/sign-in" className="link">I already have one →</Link>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
<div className="card">
<Sparkles className="mb-3" />
<h3 className="font-medium mb-1">Auto‑Tagging</h3>
<p className="text-sm text-fg-muted">Objects, scenes, emotions, text‑in‑image.
</p>
</div>
<div className="card">
<SearchCheck className="mb-3" />
<h3 className="font-medium mb-1">Semantic Search</h3>
<p className="text-sm text-fg-muted">Ask in natural language—get perfect results.
</p>
</div>
<div className="card">
<Shield className="mb-3" />
<h3 className="font-medium mb-1">Privacy‑first</h3>
<p className="text-sm text-fg-muted">Tag editing & redaction, local control.
</p>
</div>
</div>
</div>
</section>
</main>
);
}