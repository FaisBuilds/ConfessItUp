"use client";
import { useState } from "react";
import { Instrument_Serif } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, PaperPlaneTilt } from "@phosphor-icons/react";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

// 1. Go to https://formspree.io, create a free account + a new form.
// 2. Copy the endpoint it gives you (looks like https://formspree.io/f/xxxxxxx)
//    and paste it below. Every submission lands straight in your inbox.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

export default function RequestAreaSection() {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!area.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, area, message }),
      });
      if (res.ok) {
        setStatus("sent");
        setName("");
        setArea("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className={`${display.variable} relative z-10 max-w-2xl mx-auto mt-16 mb-10 px-4`}>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-2">
          <MapPin weight="fill" size={16} className="text-pink-400" />
          <span className="text-[11px] tracking-[0.25em] uppercase text-pink-400/70 font-medium">
            Not on the map yet?
          </span>
        </div>
        <h2
          className="italic text-3xl text-neutral-100 mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Request your area
        </h2>
        <p className="text-neutral-500 text-sm mb-6">
          City, neighborhood, society, street, college, university, even
          your building — tell us where you want a feed, and we&apos;ll add
          it.
        </p>

        {status === "sent" ? (
          <div className="text-center py-8">
            <p
              className="italic text-2xl text-pink-400 mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Got it.
            </p>
            <p className="text-neutral-500 text-sm">
              We&apos;ll add it soon — check back!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              placeholder="Area, society, street or city name"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              className="bg-white/[0.03] border-white/10 text-white rounded-xl h-10"
            />
            <Input
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/[0.03] border-white/10 text-white rounded-xl h-10"
            />
            <Textarea
              placeholder="Anything else we should know? (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-white/[0.03] border-white/10 text-white resize-none min-h-[90px] rounded-xl"
            />
            {status === "error" && (
              <p className="text-red-500 text-xs">
                Something went wrong. Mind trying again?
              </p>
            )}
            <Button
              type="submit"
              disabled={status === "sending" || !area.trim()}
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl h-10 gap-1.5 self-start px-6"
            >
              {status === "sending" ? "Sending…" : "Request area"}
              {status !== "sending" && (
                <PaperPlaneTilt weight="fill" size={14} />
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}