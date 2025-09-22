import Link from "next/link";
import { Images, Shield, SearchCheck, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <main className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Images className="w-7 h-7 text-indigo-600" />
          <span className="font-semibold text-lg">SmartGallery</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            className="text-gray-700 hover:text-indigo-600 transition"
            href="/auth/sign-in"
          >
            Sign in
          </Link>
          <Link
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-md"
            href="/auth/sign-up"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 grid place-items-center px-6">
        <div className="max-w-4xl text-center space-y-6">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
            Your private, AI-powered photo library
          </h1>
          <p className="text-fg-muted text-lg text-gray-600">
            Automatic tagging, scene & emotion understanding, OCR text capture,
            and natural-language search. Own your memories—search like you think.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow"
            >
              Create account
            </Link>
            <Link
              href="/auth/sign-in"
              className="text-indigo-600 hover:underline"
            >
              I already have one →
            </Link>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="card border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <Sparkles className="mb-3 text-indigo-600 w-6 h-6" />
              <h3 className="font-medium mb-1">Auto-Tagging</h3>
              <p className="text-sm text-gray-600">
                Objects, scenes, emotions, text-in-image.
              </p>
            </div>
            <div className="card border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <SearchCheck className="mb-3 text-indigo-600 w-6 h-6" />
              <h3 className="font-medium mb-1">Semantic Search</h3>
              <p className="text-sm text-gray-600">
                Ask in natural language—get perfect results.
              </p>
            </div>
            <div className="card border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <Shield className="mb-3 text-indigo-600 w-6 h-6" />
              <h3 className="font-medium mb-1">Privacy-first</h3>
              <p className="text-sm text-gray-600">
                Tag editing & redaction, local control.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}