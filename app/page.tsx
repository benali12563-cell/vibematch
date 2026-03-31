import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold text-gradient">VibeMatch</div>
        <Link href="/auth/login" className="btn-primary text-sm">
          כניסה / הרשמה
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 inline-block glass rounded-full px-4 py-2 text-sm text-purple-300">
            🎵 מצא את שותף המוזיקה שלך
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="text-gradient">התאמה</span>{" "}
            <span className="text-white">לפי ויב.</span>
          </h1>
          <p className="text-xl text-white/60 mb-10 max-w-xl mx-auto">
            התחבר עם אנשים שמרגישים את אותה מוזיקה שאתה מרגיש. שתף ז׳אנרים, גלה אמנים חדשים ומצא חברים שעל אותה תדר.
          </p>
          <Link href="/auth/login" className="btn-primary text-base px-10 py-4">
            התחל עכשיו — חינם ✉️
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🎸", title: "התאמת ז׳אנרים", desc: "בחר ז׳אנרים אהובים וקבל התאמות עם אנשים שחולקים את הטעם שלך." },
            { icon: "✨", title: "ציון ויב", desc: "האלגוריתם מחשב תאימות לפי ויבים משותפים — צ׳יל, אנרגטי, רומנטי ועוד." },
            { icon: "🎤", title: "אמנים משותפים", desc: "הוסף אמנים אהובים ומצא מעריצים שאוהבים את אותה מוזיקה." },
          ].map((f) => (
            <div key={f.title} className="card text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-white/30 text-sm">
        © 2026 VibeMatch. תרגיש את המוזיקה ביחד.
      </footer>
    </main>
  );
}
