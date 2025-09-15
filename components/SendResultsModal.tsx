"use client";
import React, { useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { ThankYouModal } from "@/components/ThankYouModal";
import { Telemetry } from "@/lib/telemetry";
import type { Carrera } from "@/data/schemas";

type Props = {
  open: boolean;
  onClose: () => void;
  careerNames: string[];
  source?: "career" | "comparator";
  selectedCarreras?: Carrera[];
};

export function SendResultsModal({ open, onClose, careerNames, source = "career", selectedCarreras = [] }: Props) {
  const sessionId = useMemo(() => Telemetry.events.getSessionId(), []);
  const [showThankYou, setShowThankYou] = useState(false);
  const [leadId, setLeadId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple contact form
  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"whatsapp" | "correo">("whatsapp");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const newLeadId = crypto.randomUUID();
      const programSelections = selectedCarreras.map((c, index) => ({
        program_id: c.id,
        program_name: c.nombre,
        program_type: "career",
        department_id: c.facultadId || undefined,
        department_name: undefined,
        selection_source: source,
        selection_order: index + 1,
      }));

      const payload = {
        nombre_completo: name,
        dni,
        telefono: phone,
        email,
        metodo_contacto: method,
        session_id: sessionId,
        lead_id: newLeadId,
        source: source === "comparator" ? "comparison" : "program",
        institution_type: "university",
        telemetry_events: [],
        program_selections: programSelections,
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "No se pudo guardar el lead");
      }

      setLeadId(newLeadId);
      setShowThankYou(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThankYouClose = () => {
    setShowThankYou(false);
    onClose();
  };

  if (showThankYou) {
    return (
      <ThankYouModal
        open={showThankYou}
        onClose={handleThankYouClose}
        careerNames={careerNames}
        source={source}
        leadId={leadId}
        selectedCarreras={selectedCarreras}
      />
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Enviar resultados">
      <div className="grid gap-4">
        {/* Highlight: resumen de selección */}
        <div className="text-center">
          <div className="text-lg font-semibold">Enviar resultados</div>
          <div className="opacity-70 text-sm">Se enviará un resumen de tu selección{source === "comparator" ? " (comparación)" : ""}.</div>
        </div>
        {selectedCarreras.length > 0 && (
          <div className="text-sm opacity-90 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="font-medium mb-1">Seleccionadas:</div>
            <ul className="list-disc pl-6 space-y-1">
              {selectedCarreras.map((c) => (
                <li key={c.id}>{c.nombre}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Formulario mínimo */}
        <div className="grid gap-3">
          <input className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]" placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
            <input className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm opacity-80">
              <input type="radio" name="method" checked={method === "whatsapp"} onChange={() => setMethod("whatsapp")} /> WhatsApp
            </label>
            <label className="flex items-center gap-2 text-sm opacity-80">
              <input type="radio" name="method" checked={method === "correo"} onChange={() => setMethod("correo")} /> Correo
            </label>
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Aceptar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
