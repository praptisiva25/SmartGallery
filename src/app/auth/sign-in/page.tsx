"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "../../components/auth/AuthCard";


export default function SignInPage() {
const router = useRouter();
return (
<main className="min-h-[100dvh] grid place-items-center p-6">
<AuthCard mode="signin" onSuccess={() => router.push("/dashboard")} />
<p className="mt-6 text-sm text-fg-muted">
New here? <Link className="link" href="/auth/sign-up">Create an account</Link>
</p>
</main>
);
}