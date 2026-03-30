export type MusicGenre =
  | "pop"
  | "rock"
  | "hip-hop"
  | "electronic"
  | "jazz"
  | "classical"
  | "r&b"
  | "country"
  | "metal"
  | "indie"
  | "reggae"
  | "latin"
  | "folk"
  | "blues"
  | "soul";

export type VibeType =
  | "chill"
  | "energetic"
  | "romantic"
  | "melancholic"
  | "party"
  | "focus"
  | "spiritual"
  | "nostalgic";

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  genres: MusicGenre[];
  vibes: VibeType[];
  favorite_artists: string[];
  age: number | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user_a: string;
  user_b: string;
  score: number;
  created_at: string;
}
