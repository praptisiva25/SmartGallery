export default function Settings() {
return (
<div className="grid gap-4 max-w-3xl">
<div className="card">
<h2 className="text-lg font-medium mb-2">Privacy & Redaction</h2>
<p className="text-sm text-fg-muted mb-4">Control automatic tags, face blurs, and text‑in‑image OCR retention.</p>
<div className="space-y-3">
<label className="flex items-center gap-3"><input type="checkbox" className="accent-brand-500" defaultChecked/> Enable automatic object tags</label>
<label className="flex items-center gap-3"><input type="checkbox" className="accent-brand-500" defaultChecked/> Enable scene recognition</label>
<label className="flex items-center gap-3"><input type="checkbox" className="accent-brand-500" defaultChecked/> Enable emotion analysis</label>
<label className="flex items-center gap-3"><input type="checkbox" className="accent-brand-500" defaultChecked/> Enable OCR tags</label>
<label className="flex items-center gap-3"><input type="checkbox" className="accent-brand-500"/> Auto‑blur faces on share
</label>
</div>
</div>


<div className="card">
<h2 className="text-lg font-medium mb-2">Accounts</h2>
<p className="text-sm text-fg-muted mb-4">Manage authentication and connected providers.</p>
<div className="flex gap-2">
<button className="btn">Connect Google Photos</button>
<button className="btn">Connect iCloud</button>
</div>
</div>
</div>
);
}