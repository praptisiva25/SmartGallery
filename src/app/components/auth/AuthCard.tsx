"use client";
import { useState } from "react";
import { LogIn, UserPlus, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = { mode: "signin" | "signup"; onSuccess: () => void };

/**
 * Demo auth using localStorage as a simple "dictionary" of users:
 * localStorage key: "sg:users"
 * value: JSON.stringify({ "email@example.com": "Password!1", ... })
 *
 * - Signup: adds entry (fails if already exists)
 * - Signin: checks entry and password, calls onSuccess() only when correct
 * - Forgot password: shows a demo message (no real email)
 *
 * NOTE: Demo-only. Plaintext passwords in localStorage are insecure for production.
 */
export default function AuthCard({ mode, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const readUsers = (): Record<string, string> => {
    try {
      const raw = localStorage.getItem("sg:users");
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      return {};
    }
  };

  const writeUsers = (users: Record<string, string>) => {
    localStorage.setItem("sg:users", JSON.stringify(users));
  };

  const submit = async () => {
    setError("");
    setSuccess("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password validation for both signup & signin flows (signup enforces rules)
    const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passRegex.test(pass)) {
      setError("Password must be 8+ chars, include 1 uppercase and 1 special character.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const users = readUsers();

    if (isSignup) {
      if (users[email]) {
        setLoading(false);
        setError("An account with this email already exists. Please sign in.");
        return;
      }
      // Add user
      users[email] = pass;
      writeUsers(users);

      setLoading(false);
      setSuccess("Registered successfully! Redirecting to sign in...");

      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 900);
      return;
    }

    // Signin flow
    const stored = users[email];
    if (!stored) {
      setLoading(false);
      setError("No account found for this email. Please sign up first.");
      return;
    }

    if (stored !== pass) {
      setLoading(false);
      setError("Incorrect password. Try again.");
      return;
    }

    setLoading(false);
    setSuccess("Signed in! Redirecting...");
    setTimeout(() => {
      onSuccess();
    }, 400);
  };

  // Forgot password demo handler
  const forgotPassword = async () => {
    setError("");
    setSuccess("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email to receive the reset link.");
      return;
    }

    // Optionally: check if email exists in users; show a generic message either way for security
    // const users = readUsers();
    // const exists = !!users[email];

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);

    // Demo message — do not reveal whether the email exists in a real system.
    setSuccess("A link to change your password has been sent to your email.");
    // (In a real app you'd now call your backend to send an email.)
  };

  return (
    <div className="card w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4 text-indigo-600">
        {isSignup ? <UserPlus /> : <LogIn />}
        <h2 className="text-xl font-semibold text-gray-900">
          {isSignup ? "Create account" : "Welcome back"}
        </h2>
      </div>

      <div className="space-y-3">
        <input
          className="input w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          className="btn w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Please wait…" : isSignup ? "Sign up" : "Sign in"}
        </button>

        {/* Forgot password link shown only on signin */}
        {!isSignup && (
          <div className="mt-2 flex items-center justify-between text-sm">
            <button
              onClick={forgotPassword}
              disabled={loading}
              className="inline-flex items-center gap-2 text-indigo-600 hover:underline"
            >
              <Mail className="w-4 h-4" />
              Forgot password?
            </button>

            <button
              onClick={() => {
                // Quick dev helper: clear stored users (optional)
                // Comment/uncomment if you want this feature:
                // localStorage.removeItem("sg:users");
                // setSuccess("Cleared demo users.");
              }}
              className="text-gray-400"
            >
              {/* empty placeholder to keep layout even; remove if unnecessary */}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Demo auth only (localStorage). This isn’t secure — use server-side auth and hashed passwords for production.
      </p>
    </div>
  );
}
