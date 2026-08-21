"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Instrument_Serif, Inter } from "next/font/google";
import { gsap } from "gsap";
import { getConfessionsByCity, createConfession } from "@/lib/confessions";
import { getCityByName } from "@/lib/city";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  ArrowLeft,
  Smiley,
  HeartStraight,
  PaperPlaneTilt,
} from "@phosphor-icons/react";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

type Confession = {
  id: string;
  content: string;
  like_count: number;
  created_at: string;
  city_id: string;
  cities: { name: string };
};

const MAX_WORDS = 250;

const getWordCount = (text: string) => {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
};

function normalizeCityName(city: string) {
  return city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function CityPage() {
  const { city } = useParams() as { city: string };
  const displayCity = normalizeCityName(city);
  const router = useRouter();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cityId, setCityId] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const normalizedCity = normalizeCityName(city);
      const cityData = await getCityByName(normalizedCity);
      if (cityData) setCityId(cityData.id);
      const data = await getConfessionsByCity(normalizedCity);
      setConfessions(data);
      setLoading(false);
    }
    load();
  }, [city]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!loading && feedRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".confession-card",
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
          },
        );
      }, feedRef);
      return () => ctx.revert();
    }
  }, [loading, confessions.length]);

  async function handleSubmit() {
    const words = getWordCount(content);
    if (!content.trim() || !cityId || words > MAX_WORDS) return;
    setSubmitting(true);
    await createConfession(cityId, content.trim());
    setContent("");
    setOpen(false);
    setShowEmoji(false);
    const normalizedCity = normalizeCityName(city);
    const data = await getConfessionsByCity(normalizedCity);
    setConfessions(data);
    setSubmitting(false);
  }

  return (
    <main className={`${display.variable} ${sans.variable} min-h-screen bg-[#08080a] text-white px-4 py-10 font-sans`}>
      {/* Pink gradient top */}
      <div className="fixed top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-pink-500/[0.08] to-transparent pointer-events-none z-0" />

      {/* Dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff12 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-neutral-500 hover:text-pink-400 transition-colors mb-8 text-sm"
        >
          <ArrowLeft weight="bold" size={14} />
          Back to all locations
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[11px] tracking-[0.25em] uppercase text-pink-400/70 font-medium">
              Local feed
            </span>
            <h1
              className="italic text-4xl mt-1 text-neutral-100"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {displayCity}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Anonymous confessions from your area
            </p>
          </div>
          <Dialog
            open={open}
            onOpenChange={(val) => {
              setOpen(val);
              setShowEmoji(false);
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-pink-500 hover:bg-pink-600 text-white border-none px-5 h-9 rounded-xl">
                + Confess
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-950 border-white/10 text-white sm:max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle
                  className="text-2xl italic font-normal"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Post a confession
                </DialogTitle>
                <p className="text-neutral-500 text-sm">
                  100% anonymous. No one knows it&apos;s you.
                </p>
              </DialogHeader>

              <div className="relative mt-2">
                <Textarea
                  placeholder="What's on your mind? Spill it…"
                  className="bg-white/[0.03] border-white/10 text-white resize-none min-h-[180px] text-base leading-relaxed pr-4 break-all overflow-hidden rounded-xl focus-visible:border-pink-500/40 focus-visible:ring-pink-500/20"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <p className="text-neutral-600 text-xs text-right mt-1">
                  {getWordCount(content)}/{MAX_WORDS} words
                </p>
                {getWordCount(content) > MAX_WORDS && (
                  <p className="text-red-500 text-xs mt-1">
                    You have exceeded the {MAX_WORDS} word limit!
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 relative">
                  <button
                    onClick={() => setShowEmoji((prev) => !prev)}
                    className="text-neutral-400 hover:text-pink-400 transition-colors p-1.5 rounded-md hover:bg-white/5"
                    title="Add emoji"
                  >
                    <Smiley weight="fill" size={20} />
                  </button>
                  {showEmoji && (
                    <div
                      ref={emojiRef}
                      className="absolute bottom-10 left-0 z-50"
                    >
                      <EmojiPicker
                        theme={Theme.DARK}
                        onEmojiClick={(emojiData) => {
                          setContent((prev) => prev + emojiData.emoji);
                          setShowEmoji(false);
                        }}
                        height={350}
                        width={300}
                      />
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !content.trim()}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 h-9 rounded-xl gap-1.5"
                >
                  {submitting ? "Posting…" : "Confess"}
                  {!submitting && <PaperPlaneTilt weight="fill" size={14} />}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Feed */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 animate-pulse"
              >
                <div className="h-4 bg-white/[0.06] rounded w-3/4 mb-3" />
                <div className="h-4 bg-white/[0.06] rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && confessions.length === 0 && (
          <div className="text-center mt-24">
            <p
              className="italic text-3xl mb-3 text-neutral-300"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Silence, for now.
            </p>
            <p className="text-neutral-400 font-medium">
              No confessions yet in {displayCity}.
            </p>
            <p className="text-neutral-600 text-sm mt-2">
              Be the first to spill the tea.
            </p>
          </div>
        )}

        <div ref={feedRef} className="flex flex-col gap-4">
          {confessions.map((confession) => (
            <div
              key={confession.id}
              onClick={() => router.push(`/confession/${confession.id}`)}
              className="confession-card bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 cursor-pointer hover:border-pink-500/30 hover:bg-white/[0.035] transition-all group"
            >
              {/* Anonymous badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-white/[0.05] group-hover:bg-pink-500/15 transition-colors flex items-center justify-center">
                  <span className="text-[11px] tracking-wide text-neutral-400 group-hover:text-pink-400 transition-colors">
                    ?
                  </span>
                </div>
                <span className="text-neutral-500 text-xs">Anonymous</span>
              </div>

              <p className="text-neutral-100 text-sm leading-relaxed line-clamp-4">
                {confession.content}
              </p>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
                <span className="text-neutral-600 text-xs">
                  {formatDistanceToNow(new Date(confession.created_at), {
                    addSuffix: true,
                  })}
                </span>
                <span className="text-neutral-500 text-xs flex items-center gap-1.5 group-hover:text-pink-400 transition-colors">
                  <HeartStraight weight="fill" size={13} />
                  {confession.like_count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}