import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import type { Profile } from "@/types";

function computeScore(a: Profile, b: Profile): number {
  if (!a || !b) return 0;
  const sharedGenres = a.genres.filter((g) => b.genres.includes(g)).length;
  const sharedVibes = a.vibes.filter((v) => b.vibes.includes(v)).length;
  const sharedArtists = a.favorite_artists.filter((ar) =>
    b.favorite_artists.includes(ar)
  ).length;

  const maxGenres = Math.max(a.genres.length + b.genres.length, 1);
  const maxVibes = Math.max(a.vibes.length + b.vibes.length, 1);
  const maxArtists = Math.max(a.favorite_artists.length + b.favorite_artists.length, 1);

  const score =
    (sharedGenres / maxGenres) * 50 +
    (sharedVibes / maxVibes) * 30 +
    (sharedArtists / maxArtists) * 20;

  return Math.round(score * 100);
}

export default async function DiscoverPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Profile>();

  // Get all other profiles
  const { data: others } = await supabase
    .from("profiles")
    .select("*")
    .neq("user_id", user.id)
    .returns<Profile[]>();

  const scored =
    myProfile && others
      ? others
          .map((p) => ({ profile: p, score: computeScore(myProfile, p) }))
          .sort((a, b) => b.score - a.score)
      : [];

  const profileComplete =
    myProfile && myProfile.genres.length > 0 && myProfile.vibes.length > 0;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Discover</h1>
          <p className="text-white/50 mt-1">People ranked by your vibe compatibility.</p>
        </div>

        {!profileComplete && (
          <div className="card mb-8 bg-purple-600/10 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <p className="text-white/70 text-sm">
                Set up your profile to see accurate match scores.
              </p>
              <Link href="/profile" className="btn-primary text-sm">
                Set up →
              </Link>
            </div>
          </div>
        )}

        {scored.length === 0 ? (
          <div className="card text-center py-20 text-white/30">
            <div className="text-5xl mb-4">🌍</div>
            <p>No one else has joined yet. Share VibeMatch with friends!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scored.map(({ profile, score }) => (
              <div key={profile.id} className="card glass-hover cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {(profile.display_name ?? profile.username)[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {profile.display_name ?? profile.username}
                      </div>
                      <div className="text-white/40 text-xs">@{profile.username}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-extrabold ${
                        score >= 60
                          ? "text-green-400"
                          : score >= 30
                          ? "text-yellow-400"
                          : "text-white/40"
                      }`}
                    >
                      {score}%
                    </div>
                    <div className="text-white/30 text-xs">match</div>
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-white/50 text-sm mb-4 line-clamp-2">{profile.bio}</p>
                )}

                {profile.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {profile.genres.slice(0, 4).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-300 text-xs"
                      >
                        {g}
                      </span>
                    ))}
                    {profile.genres.length > 4 && (
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/30 text-xs">
                        +{profile.genres.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {profile.vibes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {profile.vibes.slice(0, 3).map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 rounded-full bg-pink-600/20 text-pink-300 text-xs"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                )}

                {profile.location && (
                  <div className="mt-3 text-white/30 text-xs">📍 {profile.location}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
