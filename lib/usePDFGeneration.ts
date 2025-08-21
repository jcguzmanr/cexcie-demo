"use client";

import { useState, useCallback } from 'react';
import { useTelemetryEvents } from './useTelemetry';
import { PDF_STATES, THANKYOU_EVENTS } from './thankyou-events';

export type PDFState = typeof PDF_STATES[keyof typeof PDF_STATES];

export interface PDFGenerationOptions {
  leadId: string;
  source: "career" | "comparator";
  careerNames: string[];
  selectedCarreras?: Array<{ id: string; nombre: string; [key: string]: unknown }>;
}

export function usePDFGeneration() {
  const [pdfState, setPdfState] = useState<PDFState>(PDF_STATES.IDLE);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { trackCustomEvent } = useTelemetryEvents();

  const generatePDF = useCallback(async (options: PDFGenerationOptions) => {
    const { leadId, source, careerNames } = options;
    
    try {
      setPdfState(PDF_STATES.LOADING);
      setError("");
      
      // Evento: pdf_generation_pending
      trackCustomEvent(THANKYOU_EVENTS.PDF_GENERATION_PENDING, { leadId });

      // Simular generación de PDF (en producción, esto sería una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar URL del PDF
      const pdfUrl = `/api/pdf/${leadId}`;
      setPdfUrl(pdfUrl);
      setPdfState(PDF_STATES.READY);
      
      // Evento: pdf_ready
      trackCustomEvent(THANKYOU_EVENTS.PDF_READY, {
        leadId,
        pdfUrl,
        source,
        careerCount: careerNames.length
      });
      
      return pdfUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      setPdfState(PDF_STATES.ERROR);
      
      // Evento: pdf_generation_error
      trackCustomEvent(THANKYOU_EVENTS.PDF_GENERATION_ERROR, {
        leadId,
        errorType: errorMessage,
        source
      });
      
      throw err;
    }
  }, [trackCustomEvent]);

  const downloadPDF = useCallback((filename?: string) => {
    if (pdfState === PDF_STATES.READY && pdfUrl) {
      // Evento: pdf_download_clicked
      trackCustomEvent(THANKYOU_EVENTS.PDF_DOWNLOAD_CLICKED, {
        pdfUrl,
        source: "pdf_download"
      });

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename || `resumen-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
    }
  }, [pdfState, pdfUrl, trackCustomEvent]);

  const reset = useCallback(() => {
    setPdfState(PDF_STATES.IDLE);
    setPdfUrl("");
    setError("");
  }, []);

  return {
    pdfState,
    pdfUrl,
    error,
    generatePDF,
    downloadPDF,
    reset
  };
}
