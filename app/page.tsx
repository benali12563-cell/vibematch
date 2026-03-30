import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold text-gradient">VibeMatch</div>
        <div className="flex gap-4">
          <Link href="/auth/login" className="btn-secondary text-sm">
            Log in
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 inline-block glass rounded-full px-4 py-2 text-sm text-purple-300">
            🎵 Find your musical soulmate
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="text-gradient">Match</span> by{" "}
            <span className="text-white">Vibe.</span>
          </h1>
          <p className="text-xl text-white/60 mb-10 max-w-xl mx-auto">
            Connect with people who feel the same music you do. Share genres,
            discover new artists, and find friends who vibe on your frequency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-base px-8 py-3">
              Start matching free
            </Link>
            <Link href="/auth/login" className="btn-secondary text-base px-8 py-3">
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🎸",
              title: "Genre Matching",
              desc: "Select your favorite genres and get matched with people who share your taste.",
            },
            {
              icon: "✨",
              title: "Vibe Scoring",
              desc: "Our algorithm scores compatibility based on shared vibes — chill, energetic, romantic and more.",
            },
            {
              icon: "🎤",
              title: "Artist Affinity",
              desc: "Add your favorite artists and find fans who love the same music.",
            },
          ].map((f) => (
            <div key={f.title} className="card text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-white/30 text-sm">
        © 2026 VibeMatch. Feel the music together.
      </footer>
    </main>
  );
}
