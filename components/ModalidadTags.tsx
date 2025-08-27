import React from 'react';
import { Tag } from '@/lib/types/modalidad';

interface ModalidadTagsProps {
  tags: Tag[];
  className?: string;
}

export function ModalidadTags({ tags, className = "" }: ModalidadTagsProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="group relative inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--uc-purple)]/10 border border-[var(--uc-purple)]/20 text-[var(--uc-purple)] text-sm font-medium hover:bg-[var(--uc-purple)]/20 transition-all duration-200 cursor-help"
            title={tag.descripcion}
          >
            <span className="text-base">{tag.emoji}</span>
            <span className="hidden sm:inline">#{tag.texto}</span>
            <span className="sm:hidden">#{tag.texto.slice(0, 8)}...</span>
          </div>
        ))}
      </div>
      

    </div>
  );
}
