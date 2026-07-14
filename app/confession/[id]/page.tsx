"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Instrument_Serif, Inter } from "next/font/google";
import { gsap } from "gsap";
import { getConfessionById } from "@/lib/confessions";
import { likeConfession, hasUserLiked, unlikeConfession } from "@/lib/likes";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Eye } from "@phosphor-icons/react";

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

function getFingerprint() {
  return navigator.userAgent + "|" + screen.width;
}

export default function ConfessionPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [confession, setConfession] = useState<Confession | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    async function load() {
      const data = await getConfessionById(id);
      setConfession(data);
      setLikeCount(data.like_count);
      const fingerprint = getFingerprint();
      const alreadyLiked = await hasUserLiked(id, fingerprint);
      setLiked(alreadyLiked);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!loading && confession && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
      );
    }
  }, [loading, confession]);

  async function handleLike() {
    if (liking || !confession) return;
    setLiking(true);
    if (heartRef.current) {
      gsap.fromTo(
        heartRef.current,
        { scale: 1 },
        { scale: 1.35, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut" },
      );
    }
    if (liked) {
      await unlikeConfession(id, getFingerprint());
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      const result = await likeConfession(id, getFingerprint());
      if (!result.alreadyLiked) {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    }
    setLiking(false);
  }

  if (loading) {
    return (
      <main className={`${display.variable} ${sans.variable} min-h-screen bg-[#08080a] text-white flex items-center justify-center font-sans`}>
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff12 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 w-full max-w-2xl animate-pulse mx-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/[0.06]" />
            <div className="flex flex-col gap-2">
              <div className="h-3 bg-white/[0.06] rounded w-24" />
              <div className="h-3 bg-white/[0.06] rounded w-16" />
            </div>
          </div>
          <div className="h-4 bg-white/[0.06] rounded w-full mb-3" />
          <div className="h-4 bg-white/[0.06] rounded w-4/5 mb-3" />
          <div className="h-4 bg-white/[0.06] rounded w-3/5" />
        </div>
      </main>
    );
  }

  if (!confession) {
    return (
      <main className={`${display.variable} ${sans.variable} min-h-screen bg-[#08080a] text-white flex items-center justify-center font-sans`}>
        <div className="text-center px-4">
          <p
            className="italic text-4xl mb-4 text-neutral-300"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Gone without a trace.
          </p>
          <p className="text-neutral-400 font-medium">Confession not found</p>
          <p className="text-neutral-600 text-sm mt-2">
            It may have been deleted
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 text-pink-400 hover:text-pink-300 text-sm transition-colors"
          >
            Go back home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={`${display.variable} ${sans.variable} min-h-screen bg-[#08080a] text-white px-4 py-10 font-sans`}>
      {/* Background effects */}
      <div className="fixed top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-pink-500/[0.08] to-transparent pointer-events-none z-0" />
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
          onClick={() =>
            router.push(`/${confession.cities.name.toLowerCase()}`)
          }
          className="flex items-center gap-2 text-neutral-500 hover:text-pink-400 transition-colors mb-8 text-sm"
        >
          <ArrowLeft weight="bold" size={14} />
          Back to {confession.cities.name}
        </button>

        {/* Confession Card */}
        <div
          ref={cardRef}
          className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8"
        >
          {/* Anonymous badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Eye weight="bold" size={18} />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Anonymous</p>
              <p className="text-xs text-neutral-500">
                {formatDistanceToNow(new Date(confession.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div className="ml-auto">
              <span className="text-xs text-neutral-500 border border-white/10 px-3 py-1 rounded-full">
                {confession.cities.name}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06] mb-6" />

          {/* Content */}
          <p
            className="italic text-white text-xl leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {confession.content}
          </p>

          {/* Like button */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
            <p className="text-neutral-600 text-xs">
              Did this hit too close?
            </p>
            <Button
              onClick={handleLike}
              disabled={liking}
              variant="outline"
              className={`flex items-center gap-2 transition-all rounded-xl px-5 h-9 ${
                liked
                  ? "text-pink-400 border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20"
                  : "text-neutral-400 border-white/10 hover:text-pink-400 hover:border-pink-500/30 bg-transparent hover:bg-pink-500/10"
              }`}
            >
              <span ref={heartRef} className="inline-flex">
                <Heart weight={liked ? "fill" : "regular"} size={16} />
              </span>
              {likeCount} {liked ? "Liked" : "Like"}
            </Button>
          </div>
        </div>

        {/* Bottom hint */}
        <p className="text-center text-neutral-700 text-xs mt-8">
          All confessions are 100% anonymous
        </p>
      </div>
    </main>
  );
}