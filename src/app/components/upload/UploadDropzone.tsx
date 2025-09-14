"use client";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";


export default function UploadDropzone() {
const ref = useRef<HTMLInputElement>(null);
const [files, setFiles] = useState<File[]>([]);
return (
<div className="border border-dashed border-white/15 rounded-2xl p-6 text-center">
<input ref={ref} type="file" multiple hidden onChange={(e)=> setFiles(Array.from(e.target.files||[]))}/>
<Upload className="w-8 h-8 mx-auto mb-2"/>
<div className="text-sm text-fg-muted mb-3">Drop photos/videos or click to upload</div>
<button className="btn" onClick={()=>ref.current?.click()}>Choose files</button>
{!!files.length && (
<div className="text-xs text-left mt-4 opacity-80">
<div className="font-medium mb-1">Ready to import:</div>
<ul className="list-disc pl-5 space-y-1">
{files.slice(0,5).map(f=> <li key={f.name}>{f.name}</li>)}
</ul>
</div>
)}
</div>
);
}