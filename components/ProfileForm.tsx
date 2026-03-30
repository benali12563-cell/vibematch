"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile, MusicGenre, VibeType } from "@/types";

const ALL_GENRES: MusicGenre[] = [
  "pop", "rock", "hip-hop", "electronic", "jazz", "classical",
  "r&b", "country", "metal", "indie", "reggae", "latin", "folk", "blues", "soul",
];

const ALL_VIBES: VibeType[] = [
  "chill", "energetic", "romantic", "melancholic", "party", "focus", "spiritual", "nostalgic",
];

const GENRE_EMOJI: Record<MusicGenre, string> = {
  pop: "🎤", rock: "🎸", "hip-hop": "🎧", electronic: "🎛️", jazz: "🎷",
  classical: "🎻", "r&b": "🎙️", country: "🤠", metal: "🤘", indie: "🌿",
  reggae: "🌴", latin: "💃", folk: "🪕", blues: "🎺", soul: "🕯️",
};

const VIBE_EMOJI: Record<VibeType, string> = {
  chill: "😌", energetic: "⚡", romantic: "💕", melancholic: "🌧️",
  party: "🎉", focus: "🎯", spiritual: "🌌", nostalgic: "📻",
};

interface ProfileFormProps {
  initialProfile: Profile | null;
  userId: string;
}

export default function ProfileForm({ initialProfile, userId }: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialProfile?.display_name ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [location, setLocation] = useState(initialProfile?.location ?? "");
  const [genres, setGenres] = useState<MusicGenre[]>(initialProfile?.genres ?? []);
  const [vibes, setVibes] = useState<VibeType[]>(initialProfile?.vibes ?? []);
  const [artistInput, setArtistInput] = useState("");
  const [artists, setArtists] = useState<string[]>(initialProfile?.favorite_artists ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleGenre(g: MusicGenre) {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function toggleVibe(v: VibeType) {
    setVibes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function addArtist() {
    const trimmed = artistInput.trim();
    if (trimmed && !artists.includes(trimmed) && artists.length < 10) {
      setArtists((prev) => [...prev, trimmed]);
      setArtistInput("");
    }
  }

  function removeArtist(a: string) {
    setArtists((prev) => prev.filter((x) => x !== a));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();

    const payload = {
      user_id: userId,
      display_name: displayName || null,
      bio: bio || null,
      location: location || null,
      genres,
      vibes,
      favorite_artists: artists,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({ ...payload, username: initialProfile?.username ?? userId }, {
        onConflict: "user_id",
      });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Basic info */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-white">Basic Info</h2>
        <div>
          <label className="block text-sm text-white/70 mb-1">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="input-field"
            maxLength={50}
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others about your music taste…"
            className="input-field resize-none h-24"
            maxLength={200}
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
            className="input-field"
            maxLength={100}
          />
        </div>
      </div>

      {/* Genres */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">
          Genres{" "}
          <span className="text-white/30 text-sm font-normal">({genres.length} selected)</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {ALL_GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGenre(g)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                genres.includes(g)
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "glass glass-hover text-white/60"
              }`}
            >
              {GENRE_EMOJI[g]} {g}
            </button>
          ))}
        </div>
      </div>

      {/* Vibes */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">
          Vibes{" "}
          <span className="text-white/30 text-sm font-normal">({vibes.length} selected)</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {ALL_VIBES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => toggleVibe(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                vibes.includes(v)
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                  : "glass glass-hover text-white/60"
              }`}
            >
              {VIBE_EMOJI[v]} {v}
            </button>
          ))}
        </div>
      </div>

      {/* Artists */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">
          Favorite Artists{" "}
          <span className="text-white/30 text-sm font-normal">({artists.length}/10)</span>
        </h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={artistInput}
            onChange={(e) => setArtistInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addArtist())}
            placeholder="Type artist name and press Enter"
            className="input-field flex-1"
            maxLength={100}
          />
          <button
            type="button"
            onClick={addArtist}
            className="btn-secondary px-4"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {artists.map((a) => (
            <span
              key={a}
              className="glass px-3 py-1 rounded-full text-sm text-white/80 flex items-center gap-2"
            >
              {a}
              <button
                type="button"
                onClick={() => removeArtist(a)}
                className="text-white/40 hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary w-full py-3 disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "✓ Saved!" : "Save profile"}
      </button>
    </form>
  );
}
