"use client";
import React from "react";
import { motion } from "framer-motion";
import overviewData from "@/data/modalidad-overview.json";
import { Modalidad, ModalidadOverviewSchema } from "@/data/schemas";

type ModalidadOverviewProps = {
  modalidad: Modalidad;
};

const categoryIcons: Record<string, string> = {
  queEs: "❓",
  beneficios: "✨",
  duracion: "⏱️",
  ventajas: "💎",
  maximoTiempoVirtual: "🕒",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function ModalidadOverview({ modalidad }: ModalidadOverviewProps) {
  const parsed = ModalidadOverviewSchema.parse(overviewData);

  // Carrusel continuo: 3 visibles en desktop, 1 en móvil
  const [visible, setVisible] = React.useState(3);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setVisible(mq.matches ? 3 : 1);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const maxIndex = Math.max(0, parsed.length - visible);
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    if (maxIndex === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % (maxIndex + 1)), 5000);
    return () => clearInterval(id);
  }, [maxIndex]);

  const stepPercent = 100 / visible; // cuanto mover por tarjeta

  return (
    <div className="relative w-full overflow-hidden rounded-xl pb-5 mx-auto max-w-[1160px]">
      <motion.div
        className="flex"
        animate={{ x: `-${index * stepPercent}%` }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        {parsed.map((row) => {
          const icon = categoryIcons[row.id] ?? "📌";
          const content =
            modalidad === "presencial"
              ? row.presencial
              : modalidad === "semipresencial"
                ? row.semipresencial
                : row.distancia;
          return (
            <motion.div
              key={row.id}
              variants={item}
              initial="hidden"
              animate="show"
              className="basis-full md:basis-1/3 shrink-0 p-2"
            >
              <div className="h-full rounded-xl border border-[var(--uc-purple)]/20 bg-gradient-to-br from-[var(--uc-purple)]/5 to-[var(--uc-lilac)]/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{icon}</span>
                  <div className="text-[var(--uc-purple)] font-semibold text-xs">{row.title}</div>
                </div>
                <div className="text-xs md:text-[13px] leading-relaxed text-[var(--foreground)] opacity-90 whitespace-pre-line">
                  {content}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dots por posición (total - visible + 1) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full ${i === index ? 'bg-[var(--uc-purple)] scale-125' : 'bg-[var(--uc-purple)]/30'} transition-transform`}
            aria-label={`Ir a posición ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}


