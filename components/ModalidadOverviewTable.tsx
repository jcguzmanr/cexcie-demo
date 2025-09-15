"use client";
import React from "react";
import overviewData from "@/data/modalidad-overview.json";

export function ModalidadOverviewTable() {
  return (
    <div className="grid gap-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          Comparativa por modalidad
        </h3>
        <p className="text-sm opacity-70 max-w-2xl mx-auto">
          Tabla comparativa basada en la información de modalidades (presencial, semipresencial y a distancia)
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden min-w-[960px]">
          {/* Header */}
          <div className="grid grid-cols-4 divide-x divide-[var(--border)]">
            <div className="p-4 min-w-[200px] sticky left-0 z-20 bg-[var(--surface)] border-r border-[var(--border)]">
              <div className="font-semibold text-[var(--foreground)] text-sm">Categorías</div>
            </div>
            {(["presencial", "semipresencial", "distancia"] as const).map((key) => (
              <div key={key} className="p-4 bg-[var(--uc-purple)]/10 text-[var(--foreground)] min-w-[200px]">
                <div className="font-semibold text-sm capitalize">
                  {key === "distancia" ? "A distancia" : key}
                </div>
              </div>
            ))}
          </div>

          {/* Rows */}
          {overviewData.map((row, idx) => (
            <div
              key={row.id}
              className={`grid grid-cols-4 divide-x divide-[var(--border)] ${idx % 2 === 0 ? "bg-[var(--surface)]" : "bg-[var(--surface)]/50"}`}
            >
              <div className={`p-4 min-w-[200px] sticky left-0 z-10 border-r border-[var(--border)] ${idx % 2 === 0 ? "bg-[var(--surface)]" : "bg-[var(--surface)]/50"}`}>
                <div className="font-medium text-[var(--foreground)] text-sm leading-tight">
                  {row.title}
                </div>
              </div>
              {(["presencial", "semipresencial", "distancia"] as const).map((key) => (
                <div key={key} className="p-4 min-w-[200px]">
                  <div className="text-sm text-[var(--foreground)] opacity-85 leading-relaxed whitespace-pre-wrap">
                    {(row as Record<string, string>)[key]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


