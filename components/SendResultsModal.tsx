"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { cx } from "@/lib/ui";

type Props = { open: boolean; onClose: () => void; careerNames: string[] };

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
        className={cx("px-4 py-3 rounded-xl border bg-white", error ? "border-red-500 focus-visible:ring-red-500/40" : undefined)}
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
        className="px-4 py-3 rounded-xl border bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function SendResultsModal({ open, onClose, careerNames }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "correo">("correo");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  const [cta, setCta] = useState<{ helper?: string; label?: string } | null>(null);
  useEffect(() => {
    fetch("/data/comparador-data.json")
      .then((r) => r.json())
      .then((j: ComparadorUI) => setCta(j.ui?.cta ?? null))
      .catch(() => {});
  }, []);

  function handleSend() {
    const next: { name?: string; phone?: string; email?: string } = {};
    if (name.trim().length < 2) next.name = "Ingresa tu nombre completo.";
    if (!validatePhone(phone)) next.phone = "Ingresa un teléfono válido (e.g., +51 999 999 999).";
    if (!validateEmail(email)) next.email = "Ingresa un email válido.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSent(true);
    }
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
          <div className="flex justify-end">
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <p className="opacity-80 text-sm">
            Completa tus datos para enviarte un resumen de tu comparación de {careerNames.filter(Boolean).join(", ")}. 
          </p>
          <div className="grid gap-3">
            <Field label="Nombre" value={name} onChange={setName} placeholder="Nombres y apellidos" error={errors.name} />
            <Field label="Teléfono" value={phone} onChange={setPhone} placeholder="+51 999 999 999" error={errors.phone} />
            <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="tucorreo@ejemplo.com" error={errors.email} />
            <SelectField
              label="Medio de contacto"
              value={contactMethod}
              onChange={(v) => setContactMethod(v as "whatsapp" | "correo")}
              options={[
                { value: "whatsapp", label: "WhatsApp" },
                { value: "correo", label: "Correo" },
              ]}
            />
          </div>
          <div className="text-xs opacity-60">
            Al enviar, aceptas ser contactado con información sobre admisión. Tus datos serán tratados conforme a nuestras políticas.
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSend}>{cta?.label ?? "Enviar"}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}


