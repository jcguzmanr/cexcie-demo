"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { cx } from "@/lib/ui";
import { ThankYouModal } from "./ThankYouModal";
import { useTelemetryEvents } from "@/lib/useTelemetry";
import { Carrera } from "@/data/schemas";

type Props = { 
  open: boolean; 
  onClose: () => void; 
  careerNames: string[];
  source?: "career" | "comparator";
  selectedCarreras?: Carrera[];
};

// Shape mínima del JSON de comparador para evitar `any`
type ComparadorUI = { ui?: { cta?: { helper?: string; label?: string } } };

function validateEmail(value: string) {
  return /.+@.+\..+/.test(value);
}

function validatePhone(value: string) {
  return /^\+?\d[\d\s-]{6,}$/.test(value);
}

function Field({ label, value, onChange, type = "text", placeholder, error }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium opacity-80">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className={cx("px-4 py-3 rounded-xl border bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]", error ? "border-red-500 focus-visible:ring-red-500/40" : undefined)}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium opacity-80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 rounded-xl border bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function SendResultsModal({ 
  open, 
  onClose, 
  careerNames, 
  source = "career",
  selectedCarreras = []
}: Props) {
  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "correo">("whatsapp");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; dni?: string; phone?: string; email?: string }>({});
  const [leadId, setLeadId] = useState<string>("");
  const [showThankYou, setShowThankYou] = useState(false);

  const [cta, setCta] = useState<{ helper?: string; label?: string } | null>(null);
  const { trackCustomEvent } = useTelemetryEvents();

  useEffect(() => {
    fetch("/data/comparador-data.json")
      .then((r) => r.json())
      .then((j: ComparadorUI) => setCta(j.ui?.cta ?? null))
      .catch(() => {});
  }, []);

  function handleSend() {
    const next: { name?: string; dni?: string; phone?: string; email?: string } = {};
    if (name.trim().length < 2) next.name = "Ingresa tu nombre completo.";
    if (dni.trim().length < 8) next.dni = "Ingresa tu DNI (mínimo 8 dígitos).";
    if (!validatePhone(phone)) next.phone = "Ingresa un teléfono válido (e.g., +51 999 999 999).";
    if (!validateEmail(email)) next.email = "Ingresa un email válido.";
    setErrors(next);
    
    if (Object.keys(next).length === 0) {
      // Generar leadId único
      const newLeadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setLeadId(newLeadId);
      
      // Track lead submission
      trackCustomEvent("lead_submitted", {
        source,
        leadId: newLeadId,
        contactMethod,
        careerCount: careerNames.length,
        dni: dni.trim()
      });
      
      setSent(true);
      setShowThankYou(true);
    }
  }

  const handleThankYouClose = () => {
    setShowThankYou(false);
    setSent(false);
    onClose();
  };

  // Si ya se envió y se debe mostrar el ThankYou, mostrar ese modal
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
      {sent ? (
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700">✓</div>
            <div>
              <div className="font-semibold">¡Gracias! Hemos enviado tus resultados</div>
              <div className="text-sm opacity-80">Pronto nos pondremos en contacto contigo para resolver tus dudas y acompañarte en el proceso de admisión.</div>
            </div>
          </div>
          <div className="text-sm opacity-80">
            {contactMethod === "correo" ? (
              <>Se enviará un resumen a <strong>{email}</strong>.</>
            ) : (
              <>Te contactaremos por WhatsApp al <strong>{phone}</strong>.</>
            )}
          </div>
          <div className="text-sm opacity-70">
            DNI registrado: <strong>{dni}</strong>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="text-center mb-4">
            <div className="text-2xl font-semibold mb-2">Información de contacto</div>
            <div className="opacity-70">
              {cta?.helper || "Completa tus datos para recibir información detallada"}
            </div>
          </div>

          <Field
            label="Nombre completo"
            value={name}
            onChange={setName}
            placeholder="Tu nombre completo"
            error={errors.name}
          />

          <Field
            label="DNI"
            value={dni}
            onChange={setDni}
            placeholder="12345678"
            error={errors.dni}
          />

          <Field
            label="Teléfono"
            value={phone}
            onChange={setPhone}
            type="tel"
            placeholder="+51 999 999 999"
            error={errors.phone}
          />

          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="tu@email.com"
            error={errors.email}
          />

          <SelectField
            label="Método de contacto preferido"
            value={contactMethod}
            onChange={(v) => setContactMethod(v as "whatsapp" | "correo")}
            options={[
              { value: "whatsapp", label: "WhatsApp" },
              { value: "correo", label: "Correo electrónico" }
            ]}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSend} className="flex-1">
              {cta?.label || "Enviar"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}


