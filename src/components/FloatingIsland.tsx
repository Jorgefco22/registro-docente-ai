import React, { useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface FloatingIslandProps {
  isOpen: boolean;
  studentName: string;
  columnName: string;
  currentValue: number | 'NP' | 'P' | 'SE';
  onSelectValue: (value: number | 'NP' | 'P' | 'SE') => void;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const FloatingIsland: React.FC<FloatingIslandProps> = ({
  isOpen,
  studentName,
  columnName,
  currentValue,
  onSelectValue,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false
}) => {
  const islandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && islandRef.current) {
      islandRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numericOptions = [5, 6, 7, 8, 9, 10];
  const specialOptions = [
    { label: 'NP', value: 'NP' as const, desc: 'No Presentó' },
    { label: 'Pendiente', value: 'P' as const, desc: 'Por calificar' },
    { label: 'Sin Entregar', value: 'SE' as const, desc: 'Falta entrega' }
  ];

  return (
    <div className="floating-island-overlay no-print">
      <div 
        ref={islandRef}
        className="floating-island-container"
        tabIndex={0}
      >
        {/* Header Details */}
        <div className="island-header">
          <div className="island-meta">
            <span className="meta-col">{columnName}</span>
            <h4 className="meta-student">{studentName}</h4>
          </div>
          
          <div className="island-actions">
            {/* Nav Arrows to change row */}
            <div className="island-nav-arrows">
              <button 
                onClick={onPrev} 
                disabled={!hasPrev} 
                className="arrow-btn"
                title="Alumno anterior"
              >
                <ChevronUp size={18} />
              </button>
              <button 
                onClick={onNext} 
                disabled={!hasNext} 
                className="arrow-btn"
                title="Siguiente alumno"
              >
                <ChevronDown size={18} />
              </button>
            </div>
            
            <button onClick={onClose} className="island-close-btn" title="Cerrar Captura">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Input Buttons */}
        <div className="island-buttons-section">
          {/* Numbers */}
          <div className="island-btn-row numeric">
            {numericOptions.map((num) => {
              const isSelected = currentValue === num;
              return (
                <button
                  key={num}
                  onClick={() => onSelectValue(num)}
                  className={`island-btn ${isSelected ? 'active' : ''}`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Specials */}
          <div className="island-btn-row special">
            {specialOptions.map((opt) => {
              const isSelected = currentValue === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onSelectValue(opt.value)}
                  className={`island-btn ${isSelected ? 'active' : ''}`}
                  title={opt.desc}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="island-hint">
          <span>* Doble clic en la celda para escribir valor manual</span>
        </div>
      </div>
    </div>
  );
};
