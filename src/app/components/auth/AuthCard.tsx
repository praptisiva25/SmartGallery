"use client";
import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";


type Props = { mode: "signin" | "signup"; onSuccess: () => void };



export default function AuthCard({ mode, onSuccess }: Props) {
const [email, setEmail] = useState("");
const [pass, setPass] = useState("");
const [loading, setLoading] = useState(false);
const isSignup = mode === "signup";


const submit = async () => {
setLoading(true);
await new Promise(r => setTimeout(r, 700));
localStorage.setItem("sg:user", JSON.stringify({ email }));
setLoading(false);
onSuccess();
};


return (
<div className="card w-full max-w-md">
<div className="flex items-center gap-2 mb-4">
{isSignup ? <UserPlus/> : <LogIn/>}
<h2 className="text-lg font-medium">{isSignup ? "Create account" : "Welcome back"}</h2>
</div>
<div className="space-y-3">
<input className="input w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
<input className="input w-full" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)}/>
<button className="btn w-full" onClick={submit} disabled={loading}>{loading?"Please wait…": isSignup?"Sign up":"Sign in"}</button>
</div>
<p className="text-xs text-fg-muted mt-3">Demo auth only. Replace with Clerk/Auth.js in minutes.
</p>
</div>
);
}