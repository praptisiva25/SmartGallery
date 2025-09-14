"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthCard from "../../components/auth/AuthCard";


export default function SignUpPage() {
const router = useRouter();
return (
<main className="min-h-[100dvh] grid place-items-center p-6">
<AuthCard mode="signup" onSuccess={() => router.push("/dashboard")} />
<p className="mt-6 text-sm text-fg-muted">
Already have an account? <Link className="link" href="/auth/sign-in">Sign in</Link>
</p>
</main>
);
}