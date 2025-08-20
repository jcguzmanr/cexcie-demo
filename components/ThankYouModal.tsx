"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { useTelemetryEvents } from "@/lib/useTelemetry";
import { usePDFGeneration } from "@/lib/usePDFGeneration";
import { HighlightsSection } from "./HighlightsSection";
import { ChannelActionButtons } from "./ChannelActionButtons";
import { LegalNoteSection } from "./LegalNoteSection";
import { Carrera } from "@/data/schemas";
import { HIGHLIGHTS_CONFIG } from "@/lib/thankyou-events";

type Props = { 
  open: boolean; 
  onClose: () => void; 
  careerNames: string[];
  source: "career" | "comparator";
  leadId?: string;
  selectedCarreras?: Carrera[];
};

export function ThankYouModal({ 
  open, 
  onClose, 
  careerNames, 
  source, 
  leadId,
  selectedCarreras = []
}: Props) {
  const [highlights, setHighlights] = useState<string[]>([]);
  const { trackCustomEvent } = useTelemetryEvents();
  const { 
    pdfState, 
    pdfUrl, 
    error, 
    generatePDF, 
    downloadPDF, 
    reset 
  } = usePDFGeneration();

  // Generar highlights dinámicos según el origen
  useEffect(() => {
    if (source === "career" && careerNames.length === 1) {
      setHighlights(HIGHLIGHTS_CONFIG.career);
    } else if (source === "comparator" && careerNames.length > 1) {
      setHighlights(HIGHLIGHTS_CONFIG.comparator);
    }
  }, [source, careerNames]);

  // Iniciar generación de PDF cuando se abre el modal
  useEffect(() => {
    if (open && leadId) {
      // Evento: thankyou_viewed
      trackCustomEvent("thankyou_viewed", {
        source,
        leadId,
        careerCount: careerNames.length
      });

      // Evento: highlights_displayed
      trackCustomEvent("highlights_displayed", {
        items: highlights,
        source
      });

      // Generar PDF automáticamente
      generatePDF({
        leadId,
        source,
        careerNames,
        selectedCarreras
      });
    }

    // Resetear estado cuando se cierra
    if (!open) {
      reset();
    }
  }, [open, leadId, source, highlights, careerNames, selectedCarreras, generatePDF, reset, trackCustomEvent]);

  const handleDownloadPDF = () => {
    if (pdfState === "ready") {
      const filename = `resumen-${source}-${careerNames.join("-")}-${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(filename);
    }
  };

  const handleSendViaChannel = (channel: "whatsapp" | "email" | "sms") => {
    // Evento: send_via_channel_clicked
    trackCustomEvent("send_via_channel_clicked", {
      leadId,
      channel
    });

    // Implementar lógica de envío según el canal
    switch (channel) {
      case "whatsapp":
        const whatsappText = encodeURIComponent(
          `Hola! Me interesa obtener más información sobre ${careerNames.join(", ")}. ¿Podrían ayudarme?`
        );
        window.open(`https://wa.me/51999999999?text=${whatsappText}`, '_blank');
        break;
      case "email":
        const emailSubject = encodeURIComponent(`Información sobre ${careerNames.join(", ")}`);
        const emailBody = encodeURIComponent(
          `Hola,\n\nMe interesa obtener más información sobre ${careerNames.join(", ")}.\n\nSaludos cordiales.`
        );
        window.open(`mailto:admision@universidad.edu.pe?subject=${emailSubject}&body=${emailBody}`, '_blank');
        break;
      case "sms":
        // Implementar SMS si es necesario
        break;
    }
  };

  // Eventos adicionales según el origen
  useEffect(() => {
    if (open) {
      if (source === "career" && selectedCarreras.length === 1) {
        const carrera = selectedCarreras[0];
        trackCustomEvent("career_thankyou", {
          careerId: carrera.id,
          modality: carrera.modalidades[0],
          campus: carrera.campus[0]
        });
      } else if (source === "comparator" && selectedCarreras.length > 1) {
        trackCustomEvent("comparator_thankyou", {
          careerIds: selectedCarreras.map(c => c.id),
          attributes: ["modalidades", "campus", "facultad"]
        });
      }
    }
  }, [open, source, selectedCarreras, trackCustomEvent]);

  return (
    <Modal open={open} onClose={onClose} title="¡Gracias por tu interés!">
      <div className="grid gap-6">
        {/* Header / Mensaje de agradecimiento */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-2xl mb-4">
            ✓
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            ¡Gracias! Hemos registrado tu interés
          </h2>
          <p className="text-lg opacity-80 text-gray-700 dark:text-gray-300">
            en {source === "career" ? careerNames[0] : `la comparación de ${careerNames.length} carreras`}
          </p>
        </div>

        {/* Highlights */}
        <HighlightsSection 
          highlights={highlights} 
          source={source} 
        />

        {/* Acciones principales */}
        <div className="grid gap-4">
          {/* Botón Descargar PDF */}
          <Button
            onClick={handleDownloadPDF}
            disabled={pdfState !== "ready"}
            className="w-full"
            size="lg"
          >
            {pdfState === "loading" && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generando PDF...
              </div>
            )}
            {pdfState === "ready" && "📥 Descargar PDF"}
            {pdfState === "error" && "❌ Error al generar PDF"}
          </Button>

          {/* Mostrar error si existe */}
          {pdfState === "error" && error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800/50">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Botones de envío por canal */}
          <ChannelActionButtons
            leadId={leadId}
            onChannelAction={handleSendViaChannel}
          />
        </div>

        {/* Nota legal / transparencia */}
        <LegalNoteSection 
          leadId={leadId}
          source={source}
        />

        {/* Botón cerrar */}
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="ghost">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
