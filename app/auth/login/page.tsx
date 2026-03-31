"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("שגיאה בשליחת הלינק. נסה שוב.");
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  if (sent) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="card text-center max-w-md w-full">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-white mb-2">בדוק את המייל שלך!</h2>
          <p className="text-white/50 text-sm">
            שלחנו לינק כניסה לכתובת <span className="text-purple-400">{email}</span>
            <br />לחץ על הלינק כדי להיכנס.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 text-white/40 text-sm hover:text-white/70 transition-colors"
          >
            שלח שוב
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-2xl font-bold text-gradient text-center mb-10">
          VibeMatch
        </Link>

        <div className="card">
          <h1 className="text-2xl font-bold text-white mb-2">כניסה / הרשמה</h1>
          <p className="text-white/50 text-sm mb-8">
            הכנס את האימייל שלך ונשלח לך לינק כניסה — ללא סיסמה.
          </p>

          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? "שולח..." : "שלח לינק כניסה ✉️"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
