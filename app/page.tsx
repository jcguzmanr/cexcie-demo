import Link from "next/link";
import institutionsData from "@/data/institutions.json";
import { Card } from "@/components/Card";

type Institution = {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
};

export default function HomeHub() {
  const institutions = (institutionsData as { institutions: Institution[] }).institutions;
  const gridItems = institutions
    .filter((i) => i.id !== "cie")
    .sort((a, b) => (a.id === "uc" ? -1 : b.id === "uc" ? 1 : 0));
  return (
    <div className="py-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">Explora las unidades de CIE</h1>
      {/* Video institucional CExCIE */}
      <div className="mb-6">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-black/40">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            {/* Intentar primero el nombre correcto */}
            <source src="/media/logocexcie.mp4" type="video/mp4" />
            {/* Fallback por si el archivo quedó con doble extensión */}
            <source src="/media/logocexcie.mp4.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {gridItems.map((inst) => (
          <Link href={inst.link} key={inst.id} className={`block group ${inst.id === 'uc' ? 'sm:col-span-2' : ''}`}>
            <Card
              className={`h-full transition-transform duration-200 group-hover:shadow-lg group-hover:shadow-[var(--uc-purple)]/10 hover:scale-[1.01] ${
                inst.id === 'uc'
                  ? 'border-[var(--uc-purple)]/40 bg-gradient-to-r from-[var(--uc-purple)]/10 to-[var(--uc-lilac)]/10'
                  : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className={`w-full sm:w-48 h-28 rounded bg-[var(--surface)]/40 ${inst.id === 'uc' ? 'sm:w-56 h-32 bg-[var(--uc-purple)]/20' : ''}`} aria-hidden />
                <div className="flex-1">
                  <div className={`font-medium ${inst.id === 'uc' ? 'text-xl' : 'text-lg'}`}>{inst.name}</div>
                  <p className="text-sm text-foreground/70 mt-1 line-clamp-3">{inst.description}</p>
                  <div className="mt-3 text-sm underline underline-offset-4 group-hover:no-underline group-hover:text-[var(--uc-purple)] transition-colors">
                    Entrar a {inst.id.toUpperCase()} →
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
