import React from "react";
import { ModalidadComparison as ModalidadComparisonType } from "@/data/schemas";

interface ModalidadComparisonProps {
  comparison: ModalidadComparisonType;
}

export function ModalidadComparison({ comparison }: ModalidadComparisonProps) {
  console.log("🎨 Renderizando ModalidadComparison con:", comparison);
  
  const modalidadIcons = {
    presencial: "🏫",
    semipresencial: "🔁",
    distancia: "🌐"
  };

  const modalidadColors = {
    presencial: "from-[var(--uc-purple)] to-[var(--uc-lilac)]",
    semipresencial: "from-[var(--uc-sky)] to-[var(--uc-purple)]",
    distancia: "from-[var(--uc-lilac)] to-[var(--uc-sky)]"
  };

  const modalidadNames = {
    presencial: "Presencial",
    semipresencial: "Semipresencial",
    distancia: "A Distancia"
  };

  return (
    <div className="grid gap-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          Comparador de Modalidades
        </h3>
        <p className="text-sm opacity-70 max-w-2xl mx-auto">
          Descubre cómo se adapta {comparison.career_name} a cada modalidad de estudio y elige la que mejor se ajuste a tu estilo de aprendizaje
        </p>
      </div>

      {/* Header de modalidades */}
      <div className="grid grid-cols-3 gap-4">
        {(["presencial", "semipresencial", "distancia"] as const).map((modalidad) => (
          <div
            key={modalidad}
            className={`text-center p-4 rounded-2xl bg-gradient-to-br ${modalidadColors[modalidad]} text-white shadow-lg`}
          >
            <div className="text-3xl mb-2">{modalidadIcons[modalidad]}</div>
            <div className="font-semibold text-sm">{modalidadNames[modalidad]}</div>
          </div>
        ))}
      </div>

      {/* Tabla de comparación */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-4 divide-x divide-[var(--border)]">
            {/* Header de la tabla */}
            <div className="p-4 bg-[var(--surface)]/80 min-w-[200px]">
              <div className="font-semibold text-[var(--foreground)] text-sm">Categorías</div>
            </div>
            {(["presencial", "semipresencial", "distancia"] as const).map((modalidad) => (
              <div key={modalidad} className={`p-4 bg-gradient-to-br ${modalidadColors[modalidad]} text-white min-w-[200px]`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{modalidadIcons[modalidad]}</span>
                  <span className="font-semibold text-sm">
                    {modalidadNames[modalidad]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Filas de categorías */}
          {comparison.comparison_categories.map((category, index) => (
            <div
              key={category.category}
              className={`grid grid-cols-4 divide-x divide-[var(--border)] ${
                index % 2 === 0 ? "bg-[var(--surface)]" : "bg-[var(--surface)]/50"
              }`}
            >
              {/* Nombre de la categoría */}
              <div className="p-4 min-w-[200px]">
                <div className="font-medium text-[var(--foreground)] text-sm leading-tight">
                  {category.category}
                </div>
              </div>

              {/* Contenido para cada modalidad */}
              {(["presencial", "semipresencial", "distancia"] as const).map((modalidad) => (
                <div key={modalidad} className="p-4 min-w-[200px]">
                  <div className="text-sm text-[var(--foreground)] opacity-85 leading-relaxed">
                    {category[modalidad]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["presencial", "semipresencial", "distancia"] as const).map((modalidad) => (
          <div
            key={modalidad}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{modalidadIcons[modalidad]}</span>
              <h4 className="font-semibold text-[var(--foreground)]">
                {modalidadNames[modalidad]}
              </h4>
            </div>
            <div className="text-xs opacity-70 leading-relaxed">
              {modalidad === "presencial" && "Ideal para quienes prefieren la interacción directa y la experiencia física en campus."}
              {modalidad === "semipresencial" && "Perfecta para quienes buscan flexibilidad manteniendo la conexión presencial."}
              {modalidad === "distancia" && "Excelente para quienes necesitan máxima flexibilidad y autonomía en su aprendizaje."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
