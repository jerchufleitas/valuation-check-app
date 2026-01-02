import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, FileText, Download, Edit2 } from 'lucide-react';
import { valuationQuestions } from '../data/valuationLogic';
import { getCurrencySymbol } from '../data/currencyData';
import { generateValuationPDF } from '../../pdf-generator/pdfGenerator';
import { getCurrencyLabel } from '../../../utils/formatters';
import { Building2, Globe, Truck, Anchor, MapPin, Hash, FileCheck, Info } from 'lucide-react';
import ReportSelector from './ReportSelector';

const parseArgentineNumber = (value) => {
  if (typeof value !== 'string') return value;
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

const ReportCard = ({ finalValue, blocks, summary, onReset, settings }) => {
  const [reportFormat, setReportFormat] = useState('technical');
  const { header, transaction, item, valuation, documentation } = blocks;

  const studioLogo = settings?.professionalProfile?.logo;
  const studioName = settings?.professionalProfile?.companyName;

  // Obtener adiciones activas (preguntas de categoría 'additions' con status 'SI')
  const activeAdds = valuationQuestions
    .filter(q => q.category === 'additions' && valuation[q.id]?.status === 'SI' && valuation[q.id]?.amount)
    .map(q => ({ ...q, amount: valuation[q.id].amount }));

  // Obtener deducciones activas (preguntas de categoría 'deductions' con status 'SI')
  const activeSubs = valuationQuestions
    .filter(q => q.category === 'deductions' && valuation[q.id]?.status === 'SI' && valuation[q.id]?.amount)
    .map(q => ({ ...q, amount: valuation[q.id].amount }));

  const totalAdditions = activeAdds.reduce((sum, a) => sum + parseArgentineNumber(a.amount || '0'), 0);
  const totalDeductions = activeSubs.reduce((sum, a) => sum + parseArgentineNumber(a.amount || '0'), 0);
  const hasAdjustments = (activeAdds.length + activeSubs.length) > 0;
  
  const currencySymbol = getCurrencySymbol(transaction.currency);

  return (
    <div className="report-card fade-in">
      <div className="report-header">
        <div className="report-header-title">
          <FileText size={24} className="text-accent" />
          <h2>Dictamen de Valoración</h2>
        </div>
        
        {studioLogo && (
          <div className="report-header-logo">
            <img src={studioLogo} alt="Studio Logo" />
            {studioName && <p>{studioName}</p>}
          </div>
        )}
      </div>

      <div className="report-summary">
        <div className="report-summary-header">
          <div className="summary-grid">
            <div className="summary-info-block">
              <div className="list-info-with-icon mb-2">
                <Building2 size={16} className="text-muted opacity-60" />
                <span><strong>Exportador:</strong> {header.exporterName}</span>
              </div>
              <div className="list-info-with-icon mb-2">
                <Hash size={16} className="text-muted opacity-60" />
                <span><strong>ID Fiscal:</strong> {header.exporterTaxId}</span>
              </div>
              <div className="list-info-with-icon">
                <FileCheck size={16} className="text-accent" />
                <span><strong>Posición NCM:</strong> {item.ncmCode}</span>
              </div>
            </div>
            <div className="summary-info-block">
              <div className="list-info-with-icon mb-2">
                <Truck size={16} className="text-muted opacity-60" />
                <span><strong>Transporte:</strong> {header.transportMode}</span>
              </div>
              <div className="list-info-with-icon mb-2">
                <MapPin size={16} className="text-muted opacity-60" />
                <span><strong>Lugar/Paso:</strong> {transaction.loadingPlace} / {header.borderCrossing}</span>
              </div>
              <div className="list-info-with-icon">
                <Hash size={16} className="text-muted opacity-60" />
                <span><strong>CRT/Origen:</strong> {header.transportDocument} / {documentation.originCertificate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-item main-base">
          <span className="label">Valor Total del Ítem ({transaction.incoterm})</span>
          <div className="flex items-center gap-2">
            <span className="list-currency-tag">{getCurrencyLabel(transaction.currency)}</span>
            <span className="list-amount-value">{currencySymbol} {parseArgentineNumber(item.totalValue || '0').toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        {activeAdds.length > 0 && (
          <>
            <div className="adjustment-section-header">
              <div className="section-header-left">
                <span className="section-title">Adiciones al Precio</span>
                <span className="section-subtitle">RG 2010/2006</span>
              </div>
              <div className="section-header-right">
                <span className="section-total-label">Subtotal:</span>
                <div className="flex items-center gap-2">
                  <span className="list-currency-tag">{getCurrencyLabel(transaction.currency)}</span>
                  <span className="section-total-value text-emerald-600">
                    + {currencySymbol} {totalAdditions.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
            {activeAdds.map((adj, index) => (
              <div key={`add-${index}`} className="summary-item adjustment addition">
                <div className="adj-info">
                  <span className="adj-question-number">Pregunta {adj.number}</span>
                  <span className="adj-label flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">+</span>
                    {adj.text}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-end flex-nowrap" style={{minWidth: '150px'}}>
                  <span className="list-currency-tag">{getCurrencyLabel(transaction.currency)}</span>
                  <span className="value font-bold text-emerald-600 whitespace-nowrap">
                    {currencySymbol} {parseArgentineNumber(adj.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {activeSubs.length > 0 && (
          <>
            <div className="adjustment-section-header">
              <div className="section-header-left">
                <span className="section-title">Deducciones al Precio</span>
                <span className="section-subtitle">RG 2010/2006</span>
              </div>
              <div className="section-header-right">
                <span className="section-total-label">Subtotal:</span>
                <div className="flex items-center gap-2">
                  <span className="list-currency-tag">{getCurrencyLabel(transaction.currency)}</span>
                  <span className="section-total-value text-rose-600">
                    - {currencySymbol} {totalDeductions.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
            {activeSubs.map((adj, index) => (
              <div key={`sub-${index}`} className="summary-item adjustment deduction">
                <div className="adj-info">
                  <span className="adj-question-number">Pregunta {adj.number}</span>
                  <span className="adj-label flex items-center gap-2">
                    <span className="text-rose-500 font-bold">-</span>
                    {adj.text}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-end flex-nowrap" style={{minWidth: '150px'}}>
                  <span className="list-currency-tag">{getCurrencyLabel(transaction.currency)}</span>
                  <span className="value font-bold text-rose-600 whitespace-nowrap">
                    {currencySymbol} {parseArgentineNumber(adj.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="summary-divider"></div>

        <div className="summary-total premium-total">
          <span className="label">
            <Info size={18} className="total-icon" />
            VALOR IMPONIBLE (FOB/FCA)
          </span>
          <div className="flex items-center gap-2">
            <span className="list-currency-tag">{getCurrencyLabel(transaction.currency)}</span>
            <span className="value total">{currencySymbol} {finalValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
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

      <div className="report-selector-wrapper">
         <ReportSelector onSelect={setReportFormat} />
      </div>

      <div className="report-actions">
        <button className="btn-report-secondary" onClick={() => onReset(blocks)}>
          <Edit2 size={18} /> Volver a Editar
        </button>
        <button className="btn-report-primary" onClick={() => generateValuationPDF({ 
          baseValue: item.totalValue, 
          adjustments: [...activeAdds, ...activeSubs.map(s => ({...s, type: 'deduction'}))], 
          currency: transaction.currency, 
          incoterm: transaction.incoterm, 
          productDesc: item.description, 
          ncmCode: item.ncmCode, 
          exporter: { name: header.exporterName, id: header.exporterTaxId }, 
          transport: { mode: header.transportMode, loading: transaction.loadingPlace, crossing: header.borderCrossing }, 
          documents: { crt: header.transportDocument, origin: documentation.originCertificate } 
        }, reportFormat, settings)}>
          <Download size={18} /> Descargar {reportFormat === 'legal' ? 'Dictamen' : 'Reporte'} PDF
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
