import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, FileText, Download } from 'lucide-react';
import { valuationQuestions } from '../data/valuationLogic';
import { getCurrencySymbol } from '../data/currencyData';
import { generateValuationPDF } from '../../pdf-generator/pdfGenerator';
import ReportSelector from './ReportSelector';

const ReportCard = ({ finalValue, blocks, summary, onReset }) => {
  const [reportFormat, setReportFormat] = useState('technical');
  const { header, transaction, item, valuation, documentation } = blocks;

  // Obtener adiciones activas (preguntas de categoría 'additions' con status 'SI')
  const activeAdds = valuationQuestions
    .filter(q => q.category === 'additions' && valuation[q.id]?.status === 'SI' && valuation[q.id]?.amount)
    .map(q => ({ ...q, amount: valuation[q.id].amount }));

  // Obtener deducciones activas (preguntas de categoría 'deductions' con status 'SI')
  const activeSubs = valuationQuestions
    .filter(q => q.category === 'deductions' && valuation[q.id]?.status === 'SI' && valuation[q.id]?.amount)
    .map(q => ({ ...q, amount: valuation[q.id].amount }));

  const totalAdditions = activeAdds.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
  const totalDeductions = activeSubs.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
  const hasAdjustments = (activeAdds.length + activeSubs.length) > 0;
  
  const currencySymbol = getCurrencySymbol(transaction.currency);

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
              <strong>Exportador:</strong> {header.exporterName} <br/>
              <strong>ID Fiscal:</strong> {header.exporterTaxId} <br/>
              <strong>Posición NCM:</strong> {item.ncmCode}
            </div>
            <div>
              <strong>Transporte:</strong> {header.transportMode} <br/>
              <strong>Lugar/Paso:</strong> {transaction.loadingPlace} / {header.borderCrossing} <br/>
              <strong>CRT/Origen:</strong> {header.transportDocument} / {documentation.originCertificate}
            </div>
          </div>
        </div>

        <div className="summary-item">
          <span className="label">Valor Total del Ítem ({transaction.incoterm})</span>
          <span className="value">{currencySymbol} {parseFloat(item.totalValue || 0).toLocaleString()}</span>
        </div>
        
        {activeAdds.map((adj, index) => (
          <div key={`add-${index}`} className="summary-item adjustment addition">
            <div className="adj-info">
              <span className="adj-label">{adj.text}</span>
              <span className="adj-legal">{adj.legal}</span>
            </div>
            <span className="value">
              + {currencySymbol} {parseFloat(adj.amount).toLocaleString()}
            </span>
          </div>
        ))}

        {activeSubs.map((adj, index) => (
          <div key={`sub-${index}`} className="summary-item adjustment deduction">
            <div className="adj-info">
              <span className="adj-label">{adj.text}</span>
              <span className="adj-legal">{adj.legal}</span>
            </div>
            <span className="value">
              - {currencySymbol} {parseFloat(adj.amount).toLocaleString()}
            </span>
          </div>
        ))}

        <div className="summary-divider"></div>

        <div className="summary-total">
          <span className="label">Valor Imponible (FOB/FCA)</span>
          <span className="value total">{currencySymbol} {finalValue.toLocaleString()}</span>
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
        <button className="btn-primary" onClick={() => generateValuationPDF({ 
          baseValue: item.totalValue, 
          adjustments: [...activeAdds, ...activeSubs.map(s => ({...s, type: 'deduction'}))], 
          currency: transaction.currency, 
          incoterm: transaction.incoterm, 
          productDesc: item.description, 
          ncmCode: item.ncmCode, 
          exporter: { name: header.exporterName, id: header.exporterTaxId }, 
          transport: { mode: header.transportMode, loading: transaction.loadingPlace, crossing: header.borderCrossing }, 
          documents: { crt: header.transportDocument, origin: documentation.originCertificate } 
        }, reportFormat)}>
          <Download size={18} /> Descargar {reportFormat === 'legal' ? 'Dictamen' : 'Reporte'} PDF
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
