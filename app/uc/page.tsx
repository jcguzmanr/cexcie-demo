"use client";
import Link from "next/link";
import { Button } from "@/components/Button";

import React from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

function TypingMarquee() {
  const phrases = React.useMemo(
    () => [
      "Explora tu futuro académico en Continental.",
      "Encuentra primero tu campus y luego tu carrera.",
      "Conoce nuestra propuesta educativa, paso a paso.",
      "Vive la experiencia educativa más innovadora del país.",
    ],
    []
  );
  const TYPE_MS = 50; // velocidad por carácter
  const PAUSE_MS = 1800; // pausa al terminar
  const FADE_MS = 400; // duración del fade out
  const LOOP = true;

  const [idx, setIdx] = React.useState(0);
  const [text, setText] = React.useState("");
  const [phase, setPhase] = React.useState<"typing" | "pause" | "fade">("typing");
  const [opacity, setOpacity] = React.useState(1);

  React.useEffect(() => {
    if (phase !== "typing") return;
    const current = phrases[idx];
    if (text.length < current.length) {
      const t = setTimeout(() => setText(current.slice(0, text.length + 1)), TYPE_MS);
      return () => clearTimeout(t);
    }
    const p = setTimeout(() => setPhase("fade"), PAUSE_MS);
    return () => clearTimeout(p);
  }, [phase, text, idx, phrases]);

  React.useEffect(() => {
    if (phase !== "fade") return;
    setOpacity(0);
    const t = setTimeout(() => {
      const next = idx + 1;
      const nextIdx = next < phrases.length ? next : (LOOP ? 0 : idx);
      setText("");
      setIdx(nextIdx);
      setOpacity(1);
      setPhase("typing");
    }, FADE_MS);
    return () => clearTimeout(t);
  }, [phase, idx, phrases.length]);

  return (
    <div
      className="text-xl md:text-2xl font-medium text-white/95 min-h-[2.5rem]"
      style={{ transition: `opacity ${FADE_MS}ms ease`, opacity }}
    >
      {text}
    </div>
  );
}

export default function UCHome() {
  return (
    <div className="relative min-h-[calc(100vh-56px)] rounded-2xl overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[177.78vh] h-[100vh] min-w-full min-h-full">
          <iframe
            title="UC FLOW Background Video"
            className="w-full h-full"
            src={"https://www.youtube-nocookie.com/embed/-D4DT9_iOWk?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1&playsinline=1&loop=1&rel=0&iv_load_policy=3&fs=0&cc_load_policy=0&disablekb=1&playlist=-D4DT9_iOWk"}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            frameBorder={0}
          />
        </div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>
      <div className="relative z-10 grid place-items-center min-h-[calc(100vh-56px)]">
        <div className="p-8 gap-6 text-white flex flex-col items-center text-center max-w-[720px]">
          <div className="mb-1">
            <img
              src="/brands/uc-logo.svg"
              alt="Universidad Continental"
              className="h-12 md:h-14 w-auto mx-auto drop-shadow brightness-0 invert"
            />
          </div>
          <TypingMarquee />
          <Link href="/uc/campus">
            <Button
              size="lg"
              shape="pill"
              variant="primary"
              className="shadow-lg shadow-[var(--uc-purple)]/20 hover:shadow-[var(--uc-purple)]/30 group"
            >
              <span>Empezar</span>
              <ArrowRightIcon className="ml-2 inline-block w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


