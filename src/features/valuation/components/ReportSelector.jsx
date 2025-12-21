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
    <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
        SELECCIONAR FORMATO DE REPORTE:
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {options.map((opt) => {
          const isActive = selected === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '8px',
                border: isActive ? '2px solid var(--gold-accent)' : '1px solid var(--border-color)',
                backgroundColor: isActive ? 'white' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: isActive ? 1 : 0.7,
                boxShadow: isActive ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Icon size={20} color={isActive ? 'var(--primary-color)' : 'var(--text-muted)'} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: isActive ? 'var(--primary-color)' : 'var(--text-muted)' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ReportSelector;
