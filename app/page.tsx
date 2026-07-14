"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Instrument_Serif, Inter } from "next/font/google";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getCities } from "@/lib/city";
import {
  LockKey,
  MapPinLine,
  HeartStraight,
  PushPin,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

type City = {
  id: number;
  name: string;
};

// Each confession now carries the emoji that reads it back to you —
// the one-glance tell of what kind of secret it is.
const FLOATING_CONFESSIONS = [
  { emoji: "🍿", text: "I told my boss I had a family emergency. I was watching Netflix." },
  { emoji: "💼", text: "I've been faking being busy for 3 years straight." },
  { emoji: "🔍", text: "I googled my own name hoping someone said something nice." },
  { emoji: "😅", text: "I laugh at my teacher's jokes. They're not funny. At all." },
  { emoji: "🎭", text: "I pretend to be confident online. Offline I'm a mess." },
  { emoji: "👗", text: "I dress up just to sit alone in my room and feel good." },
  { emoji: "📅", text: "I memorized her schedule just to accidentally run into her." },
  { emoji: "💡", text: "I still sleep with the lights on. I'm 22." },
];

// A second, denser set used for the mobile ticker + trending strip —
// short enough to sit comfortably in one line.
const TICKER_CONFESSIONS = [
  { emoji: "🍿", text: "Told my boss it was a family emergency. It was Netflix." },
  { emoji: "🔍", text: "Googled my own name hoping for something nice." },
  { emoji: "📅", text: "Memorized her schedule to 'accidentally' run into her." },
  { emoji: "💡", text: "Still sleep with the lights on. I'm 22." },
  { emoji: "🎭", text: "Confident online. A mess everywhere else." },
  { emoji: "👗", text: "Dress up just to sit alone in my room." },
];

function FloatingNote({
  emoji,
  text,
  style,
}: {
  emoji: string;
  text: string;
  style: React.CSSProperties & { "--rot"?: string };
}) {
  return (
    <div
      className="floating-card hidden lg:flex absolute w-[230px] flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-md pointer-events-none select-none shadow-[0_20px_45px_-20px_rgba(0,0,0,0.65)] transition-transform duration-500 hover:!rotate-0"
      style={{ transform: `rotate(${style["--rot"] ?? "0deg"})`, ...style }}
      data-opacity={style.opacity ?? 0.7}
    >
      <PushPin
        weight="fill"
        className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-pink-500/70"
        size={16}
      />
      <div className="flex items-start gap-2.5">
        <span className="text-base leading-none mt-0.5">{emoji}</span>
        <p className="text-neutral-300 text-[13px] leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function TrendingTicker() {
  const track = [...TICKER_CONFESSIONS, ...TICKER_CONFESSIONS];
  return (
    <div className="ticker-mask relative w-full overflow-hidden py-3 border-y border-white/[0.06] bg-white/[0.015]">
      <div className="ticker-track flex items-center gap-3 w-max">
        {track.map((c, i) => (
          <span
            key={i}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-[12.5px] text-neutral-400"
          >
            <span className="text-sm leading-none">{c.emoji}</span>
            {c.text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCities() {
      const data = await getCities();
      setCities(data);
      setLoading(false);
    }
    loadCities();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".hero-eyebrow",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5 },
      )
        .fromTo(
          ".hero-title",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.25",
        )
        .fromTo(
          ".hero-sub",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.45",
        )
        .fromTo(
          ".hero-search",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.35",
        )
        .fromTo(
          ".floating-card",
          { opacity: 0, scale: 0.92, y: 10 },
          {
            opacity: (_i, el) => parseFloat(el.dataset.opacity || "0.7"),
            scale: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
          },
          "-=0.3",
        );

      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.06,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          },
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const floatingCards = [
    { c: FLOATING_CONFESSIONS[0], style: { top: "8%", left: "3%", opacity: 0.75, "--rot": "-3deg" } },
    { c: FLOATING_CONFESSIONS[1], style: { top: "14%", right: "4%", opacity: 0.6, "--rot": "2deg" } },
    { c: FLOATING_CONFESSIONS[2], style: { top: "42%", left: "1%", opacity: 0.5, "--rot": "1.5deg" } },
    { c: FLOATING_CONFESSIONS[3], style: { top: "54%", right: "2%", opacity: 0.65, "--rot": "-2deg" } },
    { c: FLOATING_CONFESSIONS[4], style: { bottom: "20%", left: "3%", opacity: 0.5, "--rot": "2.5deg" } },
    { c: FLOATING_CONFESSIONS[5], style: { bottom: "10%", right: "3%", opacity: 0.7, "--rot": "-1.5deg" } },
    { c: FLOATING_CONFESSIONS[6], style: { top: "72%", left: "1%", opacity: 0.45, "--rot": "-2.5deg" } },
    { c: FLOATING_CONFESSIONS[7], style: { top: "30%", right: "1%", opacity: 0.5, "--rot": "3deg" } },
  ];

  return (
    <main
      ref={rootRef}
      className={`${display.variable} ${sans.variable} relative bg-[#08080a] text-white flex flex-col items-center px-4 overflow-hidden font-sans`}
    >
      {/* Grain */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff12 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Pink glow */}
      <div className="absolute top-24 w-[640px] h-[640px] bg-pink-500/[0.08] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[420px] right-0 w-[420px] h-[420px] bg-fuchsia-500/[0.05] rounded-full blur-[110px] pointer-events-none" />

      {/* Floating background notes - desktop only */}
      {floatingCards.map((card, i) => (
        <FloatingNote key={i} emoji={card.c.emoji} text={card.c.text} style={card.style as any} />
      ))}

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center w-full min-h-screen justify-center max-w-2xl pt-24 pb-10">
        <span className="hero-eyebrow inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-pink-400/70 font-medium mb-5 border border-pink-500/15 bg-pink-500/[0.06] rounded-full px-3.5 py-1.5">
          <Sparkle weight="fill" size={11} />
          A confession booth, for your city
          <span className="text-neutral-500 border-l border-pink-500/20 pl-2 ml-0.5 tracking-normal normal-case">
            MVP v1
          </span>
        </span>

        <h1 className="hero-title text-center text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-none">
          Confess
          <span
            className="italic text-pink-500 mx-[0.02em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            It
          </span>
          Up
        </h1>

        <p className="hero-sub text-neutral-400 mt-5 text-lg text-center max-w-md">
          The things your neighbours would never say to your face —
          <span className="text-neutral-200"> sorted by zip code, not by name.</span>
        </p>

        {/* Command Search */}
        <div className="hero-search w-full max-w-md mt-10">
          <Command className="rounded-2xl border border-white/10 bg-neutral-950/80 shadow-[0_30px_60px_-20px_rgba(236,72,153,0.15)] backdrop-blur-md">
            <CommandInput
              placeholder="Find your city — e.g. Austin, Toronto, Manila…"
              className="text-white placeholder:text-neutral-500 text-base py-3"
            />
            <CommandList className="bg-transparent">
              {loading && (
                <CommandEmpty className="text-neutral-500">
                  Loading cities…
                </CommandEmpty>
              )}
              {!loading && cities.length === 0 && (
                <CommandEmpty className="text-neutral-500">
                  No city found.
                </CommandEmpty>
              )}
              <CommandGroup
                heading="Cities"
                className="text-neutral-500 text-xs uppercase tracking-widest"
              >
                {cities.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={city.name}
                    onSelect={() =>
                      router.push(
                        `/${city.name.toLowerCase().replace(/\s+/g, "-")}`,
                      )
                    }
                    className="text-white hover:bg-pink-500/15 data-[selected=true]:bg-pink-500/15 data-[selected=true]:text-pink-400 cursor-pointer rounded-xl mx-1 my-0.5 transition-colors group"
                  >
                    <span>{city.name}</span>
                    <ArrowRight
                      weight="bold"
                      size={14}
                      className="ml-auto opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all"
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </div>

      {/* Trending ticker - visible on all breakpoints, doubles as mobile confessions preview */}
      <div className="reveal-up relative z-10 w-full max-w-5xl mb-20">
        <TrendingTicker />
      </div>

      {/* Feature Cards Section */}
      <div className="relative z-10 w-full max-w-5xl px-4 pb-24">
        <div className="text-center mb-12">
          <span className="text-[11px] tracking-[0.25em] uppercase text-pink-400/70 font-medium">
            Why people come back
          </span>
          <h2
            className="italic text-3xl mt-3 text-neutral-100"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nothing to hide behind, and nowhere to hide from.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="feature-card bg-white/[0.02] border border-white/[0.06] hover:border-pink-500/30 hover:-translate-y-1 transition-all duration-300 rounded-2xl p-8 flex flex-col gap-5">
            <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400">
              <LockKey weight="duotone" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Fully anonymous</h3>
              <p className="text-neutral-500 text-sm mt-2.5 leading-relaxed">
                No account, no name, no trace. Just you and what you needed
                to say — your secrets stay yours.
              </p>
            </div>
          </div>

          <div className="feature-card bg-white/[0.02] border border-white/[0.06] hover:border-pink-500/30 hover:-translate-y-1 transition-all duration-300 rounded-2xl p-8 flex flex-col gap-5">
            <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400">
              <MapPinLine weight="duotone" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Rooted in your city</h3>
              <p className="text-neutral-500 text-sm mt-2.5 leading-relaxed">
                Every city keeps its own secrets. Search yours and see what's
                really happening behind closed doors nearby.
              </p>
            </div>
          </div>

          <div className="feature-card bg-white/[0.02] border border-white/[0.06] hover:border-pink-500/30 hover:-translate-y-1 transition-all duration-300 rounded-2xl p-8 flex flex-col gap-5">
            <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400">
              <HeartStraight weight="duotone" size={24} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">React & relate</h3>
              <p className="text-neutral-500 text-sm mt-2.5 leading-relaxed">
                Like the ones that hit close to home — sometimes knowing
                you're not the only one is enough.
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="reveal-up mt-24">
          <div className="text-center mb-12">
            <span className="text-[11px] tracking-[0.25em] uppercase text-pink-400/70 font-medium">
              Three steps, no signup
            </span>
            <h2
              className="italic text-3xl mt-3 text-neutral-100"
              style={{ fontFamily: "var(--font-display)" }}
            >
              From your feed to your city, in seconds.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                title: "Find your city",
                body: "Search the command bar above. If it's not listed yet, more cities are added every week.",
              },
              {
                step: "02",
                title: "Say what you mean",
                body: "Write it, add an emoji if it needs one, and post — nothing is tied back to you, ever.",
              },
              {
                step: "03",
                title: "React & relate",
                body: "Like the confessions that hit close, and watch the ones that resonate rise to the top.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 flex flex-col gap-3"
              >
                <span
                  className="italic text-pink-500/60 text-xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.step}
                </span>
                <h3 className="text-white font-semibold text-lg">{s.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Confession spotlight */}
        <div className="reveal-up mt-24 rounded-3xl border border-white/[0.06] bg-white/[0.015] p-10 sm:p-14 text-center flex flex-col items-center">
          <span className="text-[11px] tracking-[0.25em] uppercase text-pink-400/70 font-medium mb-6">
            Confession of the week
          </span>
          <p
            className="italic text-2xl sm:text-3xl text-neutral-100 leading-snug max-w-xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            "😴 I set three alarms every night so it looks like I tried. I turn them all off in my sleep."
          </p>
          <div className="flex items-center gap-2 mt-6 text-neutral-500 text-xs">
            <span className="border border-white/10 px-3 py-1 rounded-full">Lahore</span>
            <span className="flex items-center gap-1.5">
              <HeartStraight weight="fill" size={12} className="text-pink-500" />
              1.2k
            </span>
          </div>
        </div>

        {/* Popular cities */}
        {!loading && cities.length > 0 && (
          <div className="reveal-up mt-24">
            <div className="text-center mb-8">
              <span className="text-[11px] tracking-[0.25em] uppercase text-pink-400/70 font-medium">
                Already spilling
              </span>
              <h2
                className="italic text-3xl mt-3 text-neutral-100"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Popular cities right now
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {cities.slice(0, 12).map((city) => (
                <button
                  key={city.id}
                  onClick={() =>
                    router.push(`/${city.name.toLowerCase().replace(/\s+/g, "-")}`)
                  }
                  className="text-sm text-neutral-300 border border-white/10 hover:border-pink-500/30 hover:text-pink-400 hover:bg-pink-500/[0.06] transition-colors rounded-full px-4 py-2"
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="reveal-up mt-24">
          <div className="text-center mb-10">
            <span className="text-[11px] tracking-[0.25em] uppercase text-pink-400/70 font-medium">
              Before you post
            </span>
            <h2
              className="italic text-3xl mt-3 text-neutral-100"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Questions people actually ask
            </h2>
          </div>
          <div className="max-w-2xl mx-auto flex flex-col divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {[
              {
                q: "Is it really anonymous?",
                a: "Yes. There's no account, no email, and no name attached to a confession. We don't display anything that could identify you.",
              },
              {
                q: "Can a confession be deleted?",
                a: "If something violates the guidelines it's removed. We're working on a self-serve delete flow for a future version.",
              },
              {
                q: "My city isn't listed — what now?",
                a: "New cities are added regularly based on demand. If enough people search for yours, it gets added.",
              },
              {
                q: "Is this moderated?",
                a: "Basic moderation is in place for MVP v1. A full reporting and review flow is planned for the next release.",
              },
            ].map((item, i) => (
              <div key={i} className="py-5">
                <p className="text-white font-medium text-sm">{item.q}</p>
                <p className="text-neutral-500 text-sm mt-2 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing CTA strip */}
        <div className="reveal-up mt-24 rounded-3xl border border-pink-500/15 bg-gradient-to-b from-pink-500/[0.06] to-transparent p-10 text-center flex flex-col items-center">
          <h3
            className="italic text-3xl sm:text-4xl text-neutral-100"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Somewhere, your city is already talking.
          </h3>
          <p className="text-neutral-500 text-sm mt-3 max-w-sm">
            Find it above, or scroll back up and search your zip. No sign-up,
            no waiting room — just the truth, unfiltered.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/[0.06] px-4 py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <span className="text-neutral-500">
            Confess<span className="text-pink-500">It</span>Up · Secrets your city never said out loud.
          </span>
          <div className="flex items-center gap-4 text-neutral-600">
            <span className="hover:text-neutral-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-neutral-300 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-neutral-300 cursor-pointer transition-colors">Contact</span>
            <span className="text-neutral-700">
              made by <span className="text-pink-500/80">FrenzyDev</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Ticker + hover keyframes — plain <style> so no extra Tailwind config is needed */}
      <style jsx>{`
        .ticker-mask {
          -webkit-mask-image: linear-gradient(
            90deg,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
          mask-image: linear-gradient(
            90deg,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
        }
        .ticker-track {
          animation: ticker-scroll 34s linear infinite;
        }
        .ticker-mask:hover .ticker-track {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}