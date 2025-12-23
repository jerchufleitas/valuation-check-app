import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, FileText, ArrowRight, Download } from 'lucide-react';
import { generateValuationPDF } from '../../pdf-generator/pdfGenerator';
import ReportSelector from './ReportSelector';

const ReportCard = ({ baseValue, adjustments, currency, incoterm, productDesc, ncmCode, exporter, transport, documents, onReset }) => {
  const [reportFormat, setReportFormat] = useState('technical');

  const totalAdditions = adjustments
    .filter(a => a.type === 'addition')
    .reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
  
  const totalDeductions = adjustments
    .filter(a => a.type === 'deduction')
    .reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
  
  const finalValue = parseFloat(baseValue) + totalAdditions - totalDeductions;
  const hasAdjustments = adjustments.length > 0;

  return (
    <div className="report-card fade-in">
      <div className="report-header">
        <FileText size={24} className="text-accent" />
        <h2>Dictamen de Valoración</h2>
      </div>

      <div className="report-summary">
        <div style={{ marginBottom: '1.5rem', padding: '1rem', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <strong>Exportador:</strong> {exporter?.name} <br/>
              <strong>ID Fiscal:</strong> {exporter?.id} <br/>
              <strong>Posición NCM:</strong> {ncmCode}
            </div>
            <div>
              <strong>Transporte:</strong> {transport?.mode} <br/>
              <strong>Lugar/Paso:</strong> {transport?.loading} / {transport?.crossing} <br/>
              <strong>CRT/Origen:</strong> {documents?.crt} / {documents?.origin}
            </div>
          </div>
        </div>

        <div className="summary-item">
          <span className="label">Valor de Factura ({incoterm})</span>
          <span className="value">{currency} {parseFloat(baseValue).toLocaleString()}</span>
        </div>
        
        {adjustments.map((adj, index) => (
          <div key={index} className={`summary-item adjustment ${adj.type}`}>
            <div className="adj-info">
              <span className="adj-label">{adj.text}</span>
              <span className="adj-legal">{adj.legal}</span>
            </div>
            <span className="value">
              {adj.type === 'addition' ? '+' : '-'} {currency} {parseFloat(adj.amount).toLocaleString()}
            </span>
          </div>
        ))}

        <div className="summary-divider"></div>

        <div className="summary-total">
          <span className="label">Valor Imponible (FOB/FCA)</span>
          <span className="value total">{currency} {finalValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="report-analysis">
        <h3>Análisis Técnico</h3>
        {hasAdjustments ? (
          <div className="analysis-box warning">
            <AlertTriangle size={20} />
            <p>
              <strong>Se REQUIEREN Ajustes.</strong><br/>
              La operación declara elementos que deben ser {totalAdditions > 0 ? "ADICIONADOS" : ""} {totalAdditions > 0 && totalDeductions > 0 ? "y" : ""} {totalDeductions > 0 ? "DEDUCIDOS" : ""} 
              del precio de factura para alcanzar el valor imponible correcto según normativa MERCOSUR.
            </p>
          </div>
        ) : (
          <div className="analysis-box success">
            <CheckCircle size={20} />
            <p>
              <strong>NO se requiere ajuste.</strong><br/>
              El precio pagado o por pagar constituye una base válida para el Valor de Transacción (Art. 1) 
              sin necesidad de adiciones del Art. 8 ni deducciones.
            </p>
          </div>
        )}
      </div>

      <div style={{ padding: '0 1.5rem' }}>
         <ReportSelector onSelect={setReportFormat} />
      </div>

      <div className="report-actions">
        <button className="btn-secondary" onClick={onReset}>Volver a Editar</button>
        <button className="btn-primary" onClick={() => generateValuationPDF({ baseValue, adjustments, currency, incoterm, productDesc, ncmCode, exporter, transport, documents }, reportFormat)}>
          <Download size={18} /> Descargar {reportFormat === 'legal' ? 'Dictamen' : 'Reporte'} PDF
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
