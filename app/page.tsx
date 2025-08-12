"use client";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-56px)] rounded-2xl overflow-hidden pt-12 md:pt-16">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {/* Video background */}
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
        {/* Overlay with subtle blur and dark tint for readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="p-8 gap-6 text-white flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-semibold drop-shadow">UC FLOW - DEMO</h1>
          <Link href="/campus">
            <Button size="lg" variant="primary" shape="pill">
              Empezar
            </Button>
          </Link>
          <div className="uc-url mt-2 text-white">ucontinental.edu.pe</div>
        </div>
      </div>
    </div>
  );
}
