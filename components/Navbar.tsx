"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "/discover", label: "Discover" },
    { href: "/profile", label: "My Profile" },
  ];

  return (
    <nav className="glass border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-gradient">
          VibeMatch
        </Link>

        <div className="flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === l.href
                  ? "bg-purple-600/30 text-purple-300"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="ml-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
