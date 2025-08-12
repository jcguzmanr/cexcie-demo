"use client";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-56px)] rounded-2xl overflow-hidden pt-12 md:pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('/background.png')" }} aria-hidden />
        <div className="absolute inset-0 bg-black/40" aria-hidden />
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
