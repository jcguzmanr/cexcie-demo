import React from 'react';
import { Caracteristicas } from '@/lib/types/modalidad';

interface ModalidadCaracteristicasProps {
  caracteristicas: Caracteristicas;
  className?: string;
}

export function ModalidadCaracteristicas({ caracteristicas, className = "" }: ModalidadCaracteristicasProps) {
  const getFlexibilidadColor = (flexibilidad: string) => {
    switch (flexibilidad.toLowerCase()) {
      case 'máxima':
        return 'text-green-500';
      case 'alta':
        return 'text-blue-500';
      case 'media':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getFlexibilidadIcon = (flexibilidad: string) => {
    switch (flexibilidad.toLowerCase()) {
      case 'máxima':
        return '🆓';
      case 'alta':
        return '⏰';
      case 'media':
        return '📅';
      default:
        return '📋';
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <span className="text-2xl">🕐</span>
          <div>
            <div className="font-medium text-sm text-[var(--foreground)]">Horarios</div>
            <div className="text-xs opacity-70">{caracteristicas.horarios}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <span className="text-2xl">👥</span>
          <div>
            <div className="font-medium text-sm text-[var(--foreground)]">Interacción</div>
            <div className="text-xs opacity-70">{caracteristicas.interaccion}</div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <span className="text-2xl">📍</span>
          <div>
            <div className="font-medium text-sm text-[var(--foreground)]">Ubicación</div>
            <div className="text-xs opacity-70">{caracteristicas.ubicacion}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <span className="text-2xl">💻</span>
          <div>
            <div className="font-medium text-sm text-[var(--foreground)]">Tecnología</div>
            <div className="text-xs opacity-70">{caracteristicas.tecnologia}</div>
          </div>
        </div>
      </div>
      
      {/* Flexibilidad destacada */}
      <div className="sm:col-span-2">
        <div className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[var(--uc-purple)]/10 to-[var(--uc-lilac)]/10 border border-[var(--uc-purple)]/20`}>
          <span className="text-3xl">{getFlexibilidadIcon(caracteristicas.flexibilidad)}</span>
          <div className="flex-1">
            <div className="font-semibold text-[var(--foreground)]">Nivel de Flexibilidad</div>
            <div className={`text-lg font-bold ${getFlexibilidadColor(caracteristicas.flexibilidad)}`}>
              {caracteristicas.flexibilidad}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
