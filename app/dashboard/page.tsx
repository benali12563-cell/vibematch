import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import type { Profile } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Profile>();

  const profileComplete =
    profile && profile.genres.length > 0 && profile.vibes.length > 0;

  const { data: matches } = await supabase
    .from("matches")
    .select("*, profile_b:profiles!matches_user_b_fkey(username, display_name, genres, vibes)")
    .eq("user_a", user.id)
    .order("score", { ascending: false })
    .limit(5);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            היי, {profile?.display_name ?? profile?.username ?? "חבר"} 👋
          </h1>
          <p className="text-white/50 mt-1">הנה סיכום הויב שלך.</p>
        </div>

        {!profileComplete && (
          <div className="card mb-8 bg-purple-600/10 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">השלם את הפרופיל שלך</p>
                <p className="text-white/50 text-sm mt-1">
                  הוסף ז׳אנרים וויבים כדי להתחיל לקבל התאמות.
                </p>
              </div>
              <Link href="/profile" className="btn-primary text-sm">
                הגדרה ←
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "ז׳אנרים", value: profile?.genres.length ?? 0 },
            { label: "ויבים", value: profile?.vibes.length ?? 0 },
            { label: "אמנים", value: profile?.favorite_artists.length ?? 0 },
            { label: "התאמות", value: matches?.length ?? 0 },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl font-extrabold text-gradient">{s.value}</div>
              <div className="text-white/50 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">ההתאמות הטובות ביותר</h2>
            <Link href="/discover" className="text-purple-400 text-sm hover:text-purple-300">
              ראה הכל ←
            </Link>
          </div>

          {matches && matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((m) => {
                const pb = m.profile_b as {
                  username: string;
                  display_name: string | null;
                  genres: string[];
                  vibes: string[];
                } | null;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                        {(pb?.display_name ?? pb?.username ?? "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">
                          {pb?.display_name ?? pb?.username}
                        </div>
                        <div className="text-white/40 text-xs">
                          {pb?.genres.slice(0, 2).join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold">{m.score}%</div>
                      <div className="text-white/30 text-xs">התאמה</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-white/30">
              <div className="text-4xl mb-3">🎵</div>
              <p>אין התאמות עדיין. השלם את הפרופיל וגלה אנשים!</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
