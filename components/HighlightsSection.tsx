"use client";

import { useState, useEffect } from 'react';
import { cx } from '@/lib/ui';

interface HighlightsSectionProps {
  highlights: string[];
  source: "career" | "comparator";
  className?: string;
}

export function HighlightsSection({ highlights, source, className }: HighlightsSectionProps) {
  const [visibleHighlights, setVisibleHighlights] = useState<string[]>([]);

  // Animación de aparición secuencial de highlights
  useEffect(() => {
    if (highlights.length === 0) return;

    const interval = setInterval(() => {
      setVisibleHighlights(prev => {
        if (prev.length < highlights.length) {
          return [...prev, highlights[prev.length]];
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 300);

    return () => clearInterval(interval);
  }, [highlights]);

  // Resetear cuando cambian los highlights
  useEffect(() => {
    setVisibleHighlights([]);
  }, [highlights]);

  const getIconForHighlight = (highlight: string, index: number) => {
    if (source === "career") {
      const icons = ["📚", "🎯", "💼"];
      return icons[index] || "✨";
    } else {
      const icons = ["⚖️", "🔍", "🎓"];
      return icons[index] || "✨";
    }
  };

  const getGradientClass = (source: "career" | "comparator") => {
    if (source === "career") {
      return "from-blue-950/30 to-indigo-950/30 border-blue-800/50";
    } else {
      return "from-purple-950/30 to-pink-950/30 border-purple-800/50";
    }
  };

  return (
    <div className={cx(
      "bg-gradient-to-r rounded-xl p-6 border transition-all duration-500",
      getGradientClass(source),
      className
    )}>
      <h3 className="font-semibold mb-4 text-center text-gray-200">
        {source === "career" ? "Lo que recibirás:" : "Resumen de tu comparación:"}
      </h3>
      
      <div className="grid gap-4">
        {highlights.map((highlight, index) => (
          <div
            key={index}
            className={cx(
              "flex items-center gap-4 p-3 rounded-lg transition-all duration-500 transform",
              visibleHighlights.includes(highlight)
                ? "opacity-100 translate-x-0 bg-white/10 shadow-none"
                : "opacity-0 translate-x-4"
            )}
            style={{
              transitionDelay: `${index * 100}ms`
            }}
          >
            <div className="flex-shrink-0 text-2xl">
              {getIconForHighlight(highlight, index)}
            </div>
            
            <div className="flex-1">
              <span className="text-sm text-gray-300 leading-relaxed">
                {highlight}
              </span>
            </div>
            
            <div className="flex-shrink-0">
              <div className={cx(
                "w-2 h-2 rounded-full transition-all duration-300",
                visibleHighlights.includes(highlight)
                  ? "bg-blue-400 scale-100"
                  : "bg-gray-600 scale-75"
              )} />
            </div>
          </div>
        ))}
      </div>

      {/* Indicador de progreso */}
      <div className="mt-4 flex justify-center">
        <div className="flex gap-2">
          {highlights.map((_, index) => (
            <div
              key={index}
              className={cx(
                "w-2 h-2 rounded-full transition-all duration-300",
                index < visibleHighlights.length
                  ? "bg-blue-400 scale-110"
                  : "bg-gray-600 scale-100"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
