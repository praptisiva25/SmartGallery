"use client";
import { useEffect, useRef } from "react";


export default function Heatmap() {
const canvasRef = useRef<HTMLCanvasElement>(null);
useEffect(()=>{
const c = canvasRef.current!; const ctx = c.getContext('2d')!;
c.width = c.clientWidth; c.height = 220;

for (let i=0;i<40;i++) {
const x = Math.random()*c.width; const y = Math.random()*c.height;
const r = 20+Math.random()*60; const g = ctx.createRadialGradient(x,y,1,x,y,r);
g.addColorStop(0, 'rgba(99,102,241,0.35)');
g.addColorStop(1, 'rgba(99,102,241,0.00)');
ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
}
},[]);
return <canvas ref={canvasRef} className="w-full h-[220px] rounded-xl border border-white/10 bg-black/20"/>;
}