import React, { useEffect, useState } from 'react';
import { FileText, Briefcase, Scale } from 'lucide-react';

const ReportSelector = ({ onSelect }) => {
  const [selected, setSelected] = useState('technical');

  useEffect(() => {
    // Load preference
    const saved = localStorage.getItem('valuation_report_pref');
    if (saved) {
        setSelected(saved);
        onSelect(saved);
    } else {
        onSelect('technical'); // default
    }
  }, []);

  const handleSelect = (id) => {
    setSelected(id);
    onSelect(id);
    localStorage.setItem('valuation_report_pref', id);
  };

  const options = [
    { id: 'technical', label: 'Planilla Técnica', icon: FileText, desc: 'Uso Interno' },
    { id: 'commercial', label: 'Resumen Comercial', icon: Briefcase, desc: 'Para Cliente' },
    { id: 'legal', label: 'Dictamen Legal', icon: Scale, desc: 'Oficial' },
  ];

  return (
    <div className="report-selector-container">
      <p className="report-selector-title">
        SELECCIONAR FORMATO DE REPORTE:
      </p>
      <div className="report-selector-grid">
        {options.map((opt) => {
          const isActive = selected === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`report-option-card ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="report-icon" />
              <div className="report-option-content">
                <div className="report-option-label">
                  {opt.label}
                </div>
                <div className="report-option-desc">{opt.desc}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default ReportSelector;
