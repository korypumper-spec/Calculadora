import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface ConceptTooltipProps {
  codigo: '002' | '011';
  titulo: string;
  descripcion: string;
  notaNormativa: string;
  externalHover?: boolean;
}

export const ConceptTooltip: React.FC<ConceptTooltipProps> = ({
  codigo,
  titulo,
  descripcion,
  notaNormativa,
  externalHover = false,
}) => {
  const [openByClick, setOpenByClick] = useState(false);
  const [openByTriggerHover, setOpenByTriggerHover] = useState(false);

  const isVisible = externalHover || openByTriggerHover || openByClick;

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpenByTriggerHover(true)}
      onMouseLeave={() => setOpenByTriggerHover(false)}
    >
      <button
        type="button"
        onClick={() => setOpenByClick((prev) => !prev)}
        onBlur={() => setOpenByClick(false)}
        aria-label={`Ayuda sobre Concepto ${codigo}`}
        aria-expanded={isVisible}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Ayuda</span>
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 bottom-full mb-2 z-40 w-[min(20rem,calc(100vw-2.5rem))] p-3 bg-slate-900 text-slate-100 text-xs rounded-md shadow-lg border border-slate-800 pointer-events-none"
        >
          <div className="font-semibold text-white mb-1">
            Concepto <span className="font-mono text-emerald-300">{codigo}</span> · {titulo}
          </div>
          <p className="text-slate-200 leading-relaxed">{descripcion}</p>
          <p className="mt-1.5 pt-1.5 border-t border-slate-700 text-[11px] text-emerald-200 leading-relaxed">
            {notaNormativa}
          </p>
        </div>
      )}
    </div>
  );
};
