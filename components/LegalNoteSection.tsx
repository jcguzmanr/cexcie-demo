"use client";

import { useState } from 'react';
import { useTelemetryEvents } from '@/lib/useTelemetry';

interface LegalNoteSectionProps {
  leadId?: string;
  source: "career" | "comparator";
  className?: string;
}

export function LegalNoteSection({ leadId, source, className }: LegalNoteSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { trackCustomEvent } = useTelemetryEvents();

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    if (newExpanded) {
      // Evento: legal_note_interacted
      trackCustomEvent("legal_note_interacted", {
        leadId,
        source,
        action: "expanded"
      });
    }
  };

  const handleLearnMore = () => {
    // Evento: legal_note_interacted
    trackCustomEvent("legal_note_interacted", {
      leadId,
      source,
      action: "learn_more"
    });
    
    // Aquí se podría abrir un modal con más información legal
    window.open('/politica-privacidad', '_blank');
  };

  return (
    <div className={`border-t border-gray-700 pt-4 ${className}`}>
      <details 
        className="group"
        open={isExpanded}
        onToggle={handleToggle}
      >
        <summary 
          className="cursor-pointer text-sm opacity-70 hover:opacity-100 transition-all duration-200 flex items-center gap-2 text-gray-300"
        >
          <span className="text-blue-400">ℹ️</span>
          <span>Información legal y de privacidad</span>
          <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </summary>
        
        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-4 text-sm text-blue-200">
            <div className="space-y-2">
              <p className="leading-relaxed">
                <strong>Consentimiento:</strong> Al proporcionar tu información, aceptas que nos pongamos en contacto contigo 
                para brindarte información sobre nuestros programas académicos.
              </p>
              
              <p className="leading-relaxed">
                <strong>Protección de datos:</strong> Tus datos serán tratados de acuerdo con nuestra política de privacidad 
                y no serán compartidos con terceros sin tu consentimiento explícito.
              </p>
              
              <p className="leading-relaxed">
                <strong>Derechos:</strong> Tienes derecho a acceder, rectificar, cancelar y oponerte al tratamiento de tus datos personales.
              </p>
            </div>
            
            <div className="mt-3 pt-3 border-t border-blue-800/50">
              <button
                onClick={handleLearnMore}
                className="text-blue-300 hover:text-blue-200 underline text-xs font-medium transition-colors"
              >
                Leer política completa de privacidad
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Tu información está segura y protegida</span>
          </div>
        </div>
      </details>
    </div>
  );
}
