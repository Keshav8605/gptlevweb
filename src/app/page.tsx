import Link from "next/link";
import { LandingHeader } from "@/components/navigation/LandingHeader";

export const metadata = {
  title: "A Little World For You 💕 | Romantic Couple Sanctuary",
  description:
    "Create a private, interactive romantic love website for your partner with photos, love letters, voice messages, collaborative journal, and surprise passcodes.",
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF0F5] via-[#FFE0EA]/30 to-[#FFF0F5] text-[var(--text-primary)]">
      {/* Global Navigation Header for Landing Page */}
      <LandingHeader />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pt-12 pb-20 sm:pt-20 sm:pb-28">
          {/* Ambient background glows */}
          <div className="absolute top-1/4 -left-28 w-96 h-96 rounded-full bg-pink-200/40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 -right-28 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
            {/* Romantic Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-pink-200 shadow-xs text-xs sm:text-sm font-rounded font-bold text-[var(--pink-strong)]">
              <span>🌸</span>
              <span>A Personal Digital Love Sanctuary</span>
            </div>

            {/* Hero Headline */}
            <h1 className="font-rounded font-bold text-3xl sm:text-5xl lg:text-6xl text-[var(--romantic-plum)] leading-tight tracking-tight max-w-4xl mx-auto">
              Create an Unforgettable Love Website For Your Favorite Person{" "}
              <span className="text-[var(--pink-strong)]">💕</span>
            </h1>

            {/* Hero Subtitle */}
            <p className="font-handwritten text-xl sm:text-2xl lg:text-3xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Photos, whispered voice messages, secret love letters, and shared dreams —
              preserved in a private sanctuary just for the two of you ♡
            </p>

            {/* Hero CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
              <Link
                href="/create"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[var(--pink-primary)] to-[var(--pink-strong)] text-white font-rounded font-bold text-sm sm:text-base shadow-lg shadow-pink-200/80 hover:opacity-95 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>Create your gift</span>
              </Link>

              <Link
                href="/story/welcome"
                className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-full border border-pink-200 bg-white/90 text-[var(--romantic-plum)] font-rounded font-bold text-sm sm:text-base hover:bg-rose-50 hover:border-pink-300 transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>📖</span>
                <span>Explore Demo Website</span>
                <span className="text-xs text-[var(--pink-strong)]">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Showcase Grid */}
        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-rounded font-bold text-2xl sm:text-4xl text-[var(--romantic-plum)]">
              Everything Your Love Story Deserves
            </h2>
            <p className="font-handwritten text-lg sm:text-xl text-[var(--text-secondary)] mt-2">
              Every feature crafted with emotion, privacy, and gentle intimacy ♡
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-shadow space-y-3">
              <span className="text-3xl block">💌</span>
              <h3 className="font-rounded font-bold text-lg text-[var(--romantic-plum)]">
                Secret Havens &amp; Letters
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Sealed love letters and hidden messages unlocked with your personal passcodes,
                custom timers, and heartfelt confessions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-shadow space-y-3">
              <span className="text-3xl block">📸</span>
              <h3 className="font-rounded font-bold text-lg text-[var(--romantic-plum)]">
                Scrapbook Polaroids
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Pin your favorite milestones, funny inside jokes, and cherished moments on a
                nostalgic, interactive memory board.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-shadow space-y-3">
              <span className="text-3xl block">🎙️</span>
              <h3 className="font-rounded font-bold text-lg text-[var(--romantic-plum)]">
                Voice Whisper Messages
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Record your voice speaking straight from the heart. Your partner can listen to
                your whispers anytime they miss your voice.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-shadow space-y-3">
              <span className="text-3xl block">📖</span>
              <h3 className="font-rounded font-bold text-lg text-[var(--romantic-plum)]">
                Our Little Notebook
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                A shared, collaborative couple journal with cozy daily prompts, gratitude notes,
                and space for both of you to write together.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-shadow space-y-3">
              <span className="text-3xl block">🗺️</span>
              <h3 className="font-rounded font-bold text-lg text-[var(--romantic-plum)]">
                Romantic Date Planner
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Plan dream weekend getaways, propose cute date nights, vote on activities, and
                keep a shared relationship bucket list.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-shadow space-y-3">
              <span className="text-3xl block">🔐</span>
              <h3 className="font-rounded font-bold text-lg text-[var(--romantic-plum)]">
                100% Private &amp; Couple-Bound
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Fortified with cryptographic invite tokens and passcodes. Only you and your partner
                can ever unlock your personal world.
              </p>
            </div>
          </div>
        </section>

        {/* Demo Experience Teaser Card */}
        <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-pink-50 via-rose-50/50 to-purple-50/40 border border-pink-200/80 shadow-md text-center space-y-5">
            <span className="text-4xl">💌</span>
            <h2 className="font-rounded font-bold text-2xl sm:text-3xl text-[var(--romantic-plum)]">
              Want to see what your partner experiences?
            </h2>
            <p className="font-handwritten text-lg sm:text-xl text-[var(--text-secondary)] max-w-xl mx-auto">
              Explore the live interactive demo website to feel the music, read love letters,
              and preview the magic.
            </p>
            <div className="pt-2">
              <Link
                href="/story/welcome"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[var(--pink-strong)] border border-pink-200 font-rounded font-bold text-sm shadow-xs hover:bg-pink-50 hover:border-pink-300 transition-all"
              >
                <span>Experience Demo Website</span>
                <span>♡</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Romantic Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-white/50 backdrop-blur-sm py-8 px-4 text-center text-xs font-rounded text-[var(--text-muted)]">
        <div className="max-w-md mx-auto space-y-2">
          <p className="font-handwritten text-lg text-[var(--pink-strong)]">
            A tiny digital universe made just for you 💕
          </p>
          <p>
            Every word, melody, and memory crafted with unconditional devotion.
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] pt-1">
            © Forever &amp; Always Yours · GPTLevWeb
          </p>
        </div>
      </footer>
    </div>
  );
}
