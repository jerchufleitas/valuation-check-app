import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { adjustmentQuestions } from '../data/valuationLogic';
import { incoterms } from '../data/incotermsLogic';
import { DollarSign, HelpCircle, ArrowRight, Truck, Shield, Search } from 'lucide-react';
import NCMTreeSelector from './NCMTreeSelector';
import { useState } from 'react';

const ValuationForm = ({ onCalculate }) => {
  const [formData, setFormData] = useLocalStorage('valuation_check_draft', {
    productDesc: '',
    reference: '',
    basePrice: '',
    currency: 'USD',
    selectedIncoterm: 'FOB',
    freight: '',
    insurance: '',
    answers: {}
  });

  const [isNcmModalOpen, setIsNcmModalOpen] = useState(false);

  const { productDesc, reference, basePrice, currency, selectedIncoterm, freight, insurance, answers } = formData;

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentIncotermData = incoterms.find(i => i.code === selectedIncoterm) || incoterms[3];

  const loadExample = () => {
    setFormData({
      productDesc: 'Mermelada de Frambuesa (Frascos 250g)',
      reference: 'Caso: Importación España -> Argentina',
      basePrice: '10000',
      currency: 'USD',
      selectedIncoterm: 'FOB',
      freight: '1500',
      insurance: '150',
      answers: {
        'containers': { active: true, amount: '2000' }
      }
    });
  };

  const clearForm = () => {
    setFormData({
      productDesc: '',
      reference: '',
      basePrice: '',
      currency: 'USD',
      selectedIncoterm: 'FOB',
      freight: '',
      insurance: '',
      answers: {}
    });
  };

  const getCalculatedCIF = () => {
    const base = parseFloat(basePrice || 0);
    const f = currentIncotermData.requiresFreight ? parseFloat(freight || 0) : 0;
    const i = currentIncotermData.requiresInsurance ? parseFloat(insurance || 0) : 0;
    return base + f + i;
  };

  const handleToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [id]: { ...prev.answers[id], active: !prev.answers[id]?.active, amount: '' }
      }
    }));
  };

  const handleAmountChange = (id, amount) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [id]: { ...prev.answers[id], amount }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!basePrice) return alert("Por favor ingrese el Precio Base");
    
    const cifValue = getCalculatedCIF();
    
    const activeAdjustments = Object.entries(answers)
      .filter(([_, val]) => val.active && val.amount)
      .map(([key, val]) => {
        const question = adjustmentQuestions.find(q => q.id === key);
        return { ...question, amount: val.amount };
      });

    onCalculate({ 
      baseValue: cifValue, 
      productDesc,
      reference,
      breakdown: {
        basePrice,
        incoterm: selectedIncoterm,
        freight: currentIncotermData.requiresFreight ? freight : '0',
        insurance: currentIncotermData.requiresInsurance ? insurance : '0',
      },
      currency, 
      incoterm: 'CIF (Base de Cálculo)', 
      adjustments: activeAdjustments 
    });
  };
  const handleNcmSelect = (node) => {
    updateField('productDesc', `[NCM ${node.code}] ${node.name}`);
    setIsNcmModalOpen(false);
  };

  return (
    <form className="valuation-form fade-in" onSubmit={handleSubmit}>
      
      {/* SECTION 1: PRICE BUILD-UP */}
      <section className="form-section">
        <div className="section-header-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3>1. Datos de la Operación</h3>
          <div className="header-actions" style={{display: 'flex', gap: '0.5rem'}}>
            <button type="button" onClick={clearForm} className="btn-secondary" style={{fontSize: '0.8rem', padding: '0.25rem 0.75rem'}}>
              Nueva Consulta
            </button>
            <button type="button" onClick={loadExample} className="btn-secondary" style={{fontSize: '0.8rem', padding: '0.25rem 0.75rem'}}>
              Cargar Ejemplo
            </button>
          </div>
        </div>

        {/* Product & Reference Inputs */}
        <div className="input-group-row" style={{marginBottom: '1.5rem'}}>
          <div className="input-field" style={{flex: 2}}>
            <label>Descripción de la Mercadería</label>
            <div style={{position: 'relative', display: 'flex', gap: '0.5rem'}}>
              <input 
                type="text" 
                placeholder="Ej. Tornos CNC, Mermelada..." 
                value={productDesc}
                onChange={(e) => updateField('productDesc', e.target.value)}
                style={{flex: 1}}
              />
              <button 
                type="button" 
                className="btn-secondary" 
                style={{padding: '0 0.75rem'}}
                onClick={() => setIsNcmModalOpen(true)}
                title="Búsqueda por Nomenclatura (NCM)"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
          <div className="input-field" style={{flex: 1}}>
            <label>Referencia / Cliente</label>
            <input 
              type="text" 
              placeholder="Ej. Op-2024-001" 
              value={reference}
              onChange={(e) => updateField('reference', e.target.value)}
            />
          </div>
        </div>
        
        <div className="input-group-row">
          <div className="input-field">
            <label>Incoterm de Origen</label>
            <select value={selectedIncoterm} onChange={(e) => updateField('selectedIncoterm', e.target.value)}>
              {incoterms.map(i => (
                <option key={i.code} value={i.code}>{i.code} - {i.name}</option>
              ))}
            </select>
          </div>
          <div className="input-field">
             <label>Moneda</label>
             <select value={currency} onChange={(e) => updateField('currency', e.target.value)}>
               <option value="USD">USD</option>
               <option value="EUR">EUR</option>
             </select>
          </div>
        </div>

        <div className="input-group-row" style={{marginTop: '1rem'}}>
          <div className="input-field">
            <label>Precio de Factura ({selectedIncoterm})</label>
            <div className="input-wrapper">
              <DollarSign size={16} className="icon" />
              <input 
                type="number" 
                placeholder="0.00" 
                value={basePrice}
                onChange={(e) => updateField('basePrice', e.target.value)}
                required
              />
            </div>
          </div>

          {currentIncotermData?.requiresFreight && (
            <div className="input-field fade-in">
              <label>Flete Internacional</label>
              <div className="input-wrapper">
                <Truck size={16} className="icon" />
                <input 
                  type="number" 
                  placeholder="Costo Flete" 
                  value={freight}
                  onChange={(e) => updateField('freight', e.target.value)}
                />
              </div>
            </div>
          )}

          {currentIncotermData?.requiresInsurance && (
             <div className="input-field fade-in">
               <label>Seguro Internacional</label>
               <div className="input-wrapper">
                 <Shield size={16} className="icon" />
                 <input 
                   type="number" 
                   placeholder="Prima Seguro" 
                   value={insurance}
                   onChange={(e) => updateField('insurance', e.target.value)}
                 />
               </div>
             </div>
          )}
        </div>

        {/* Real-time CIF Summary */}
        <div style={{marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0'}}>
           <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
             <span style={{fontSize: '0.9rem', color: '#64748b'}}>Base Imponible (CIF Calculado):</span>
             <span style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a'}}>
               {currency} {getCalculatedCIF().toLocaleString()}
             </span>
           </div>
        </div>
      </section>

      {/* SECTION 2: ADJUSTMENTS */}
      <section className="form-section">
        <h3>2. Ajustes de Valoración (Art. 8)</h3>
        <p className="section-desc">¿Existen conceptos adicionales no incluidos en el precio CIF?</p>
        
        <div className="checklist">
          {adjustmentQuestions.map((q) => (
            <div key={q.id} className={`checklist-item ${answers[q.id]?.active ? 'active' : ''}`}>
              <div className="checklist-header">
                <div className="checklist-label">
                  <span className="badge">{q.type === 'addition' ? 'SUMAR (Art 8)' : 'RESTAR (Art 1)'}</span>
                  <h4>{q.text}</h4>
                </div>
                <div className="toggle-switch" onClick={() => handleToggle(q.id)}>
                  {answers[q.id]?.active ? 'SÍ' : 'NO'}
                </div>
              </div>
              
              {answers[q.id]?.active && (
                <div className="checklist-detail slide-down">
                  <p className="detail-text"><HelpCircle size={14} /> {q.detail}</p>
                  <p className="legal-ref">{q.legal}</p>
                  <div className="checklist-input">
                    <label>{q.inputLabel}</label>
                    <div className="input-wrapper small">
                      <span className="currency-prefix">{currency}</span>
                      <input 
                        type="number" 
                        placeholder="Monto"
                        value={answers[q.id]?.amount || ''}
                        onChange={(e) => handleAmountChange(q.id, e.target.value)}
                        required={answers[q.id]?.active}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="form-actions">
        <button type="submit" className="btn-primary large">
          Verificar Valoración <ArrowRight />
        </button>
      </div>

      {isNcmModalOpen && (
        <NCMTreeSelector 
          onSelect={handleNcmSelect} 
          onClose={() => setIsNcmModalOpen(false)} 
        />
      )}
    </form>
  );
};

export default ValuationForm;
