import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { adjustmentQuestions } from '../data/valuationLogic';
import { incoterms } from '../data/incotermsLogic';
import { DollarSign, HelpCircle, ArrowRight, Truck, Shield, Search } from 'lucide-react';
import NCMTreeSelector from './NCMTreeSelector';
import { useState } from 'react';

const ValuationForm = ({ onCalculate }) => {
  const [formData, setFormData] = useLocalStorage('valuation_data_v3', {
    header: {
      userType: 'EXPORTADOR', // 'IMPORTADOR' | 'EXPORTADOR'
      exporterName: '',
      exporterTaxId: '',
      importerName: '',
      importerDetails: '',
      transportDocument: '',
      transportMode: 'Terrestre',
      presence: 'NO',
      airport: '',
      airportOther: '',
      borderCrossing: '',
    },
    transaction: {
      currency: 'USD',
      incoterm: 'FOB',
      loadingPlace: '',
    },
    item: {
      ncmCode: '',
      quantity: '',
      unit: '',
      unitValue: '',
      totalValue: '',
      description: '',
    },
    adjustments: {
      additions: {}, 
      deductions: {},
    },
    documentation: {
      originCertificateAttached: 'SI',
      originCertificate: '',
      invoiceNumber: '',
      insuranceContract: '',
      freightContract: '',
    }
  });

  const [simError, setSimError] = useState('');

  const [isNcmModalOpen, setIsNcmModalOpen] = useState(false);

  const { header, transaction, item, adjustments, documentation } = formData;

  const updateSection = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleAdjustmentToggle = (type, id) => {
    const list = type === 'addition' ? 'additions' : 'deductions';
    setFormData(prev => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [list]: { 
          ...prev.adjustments[list], 
          [id]: { 
            active: !prev.adjustments[list][id]?.active, 
            amount: '' 
          }
        }
      }
    }));
  };

  const handleAdjustmentAmount = (type, id, amount) => {
    const list = type === 'addition' ? 'additions' : 'deductions';
    setFormData(prev => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [list]: { 
          ...prev.adjustments[list], 
          [id]: { 
            ...prev.adjustments[list][id], 
            amount 
          }
        }
      }
    }));
  };

  const currentIncotermData = incoterms.find(i => i.code === transaction.incoterm) || incoterms[3];

  const loadExample = () => {
    setFormData({
      header: {
        userType: 'EXPORTADOR',
        exporterName: 'Vinos del Sur S.A.',
        exporterTaxId: '30-12345678-9',
        importerName: 'Global Imports LLC',
        importerDetails: 'Estados Unidos / NY',
        transportDocument: 'CRT-AR-2025-001',
        transportMode: 'Terrestre',
        presence: 'SI',
        airport: '',
        airportOther: '',
        borderCrossing: 'Paso de los Libres',
      },
      transaction: {
        currency: 'USD',
        incoterm: 'FOB',
        loadingPlace: 'Mendoza, Argentina',
      },
      item: {
        ncmCode: '2204.21.00.100G',
        quantity: '1200',
        unit: 'Botellas',
        unitValue: '8.50',
        totalValue: '10200',
        description: 'Vino Tinto Malbec Premium - Cosecha 2023. Estuches de madera.',
      },
      adjustments: {
        additions: { 'packaging_expo': { active: true, amount: '450' } },
        deductions: {},
      },
      documentation: {
        originCertificateAttached: 'SI',
        originCertificate: 'COD-2025-9988',
        invoiceNumber: 'FC-A-0001-000045',
        insuranceContract: 'POL-99122',
        freightContract: 'CTR-TX-55',
      }
    });
  };

  const clearForm = () => {
    setFormData({
      header: { userType: 'EXPORTADOR', exporterName: '', exporterTaxId: '', importerName: '', importerDetails: '', transportDocument: '', transportMode: 'Terrestre', presence: 'NO', airport: '', airportOther: '', borderCrossing: '' },
      transaction: { currency: 'USD', incoterm: 'FOB', loadingPlace: '' },
      item: { ncmCode: '', quantity: '', unit: '', unitValue: '', totalValue: '', description: '' },
      adjustments: { additions: {}, deductions: {} },
      documentation: { originCertificateAttached: 'SI', originCertificate: '', invoiceNumber: '', insuranceContract: '', freightContract: '' }
    });
  };

  const getCurrencySymbol = (ccy) => {
    const symbols = { 'USD': '$', 'EUR': '€', 'BRL': 'R$', 'ARS': '$', 'PYG': '₲', 'CLP': '$', 'UYU': '$' };
    return symbols[ccy] || '$';
  };

  const getTransportDocLabel = (mode) => {
    if (mode === 'Terrestre') return 'CRT';
    if (mode === 'Acuática') return 'B/L';
    if (mode === 'Aérea') return 'GUÍA AÉREA';
    return 'DOC. TRANSPORTE';
  };

  const validateSimFormat = (value) => {
    // Format: XXXX.XX.XX.XXXA (12 digits/dots + 1 letter)
    const simRegex = /^\d{4}\.\d{2}\.\d{2}\.\d{3}[A-Z]$/;
    if (value && !simRegex.test(value)) {
      setSimError('Formato SIM inválido (XXXX.XX.XX.XXXA)');
    } else {
      setSimError('');
    }
  };

  const getCalculatedValue = () => {
    const base = parseFloat(item.totalValue || 0);
    
    const adds = Object.values(adjustments.additions)
      .filter(a => a.active)
      .reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
      
    const subs = Object.values(adjustments.deductions)
      .filter(a => a.active)
      .reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
      
    let total = base + adds - subs;
    
    // Lógica de Multa: 1% si no adjunta Certificado
    if (documentation.originCertificateAttached === 'NO') {
      const fine = total * 0.01;
      total += fine;
    }

    return total;
  };

  const getFineAmount = () => {
    if (documentation.originCertificateAttached === 'NO') {
      const baseTotal = parseFloat(item.totalValue || 0);
      const adds = Object.values(adjustments.additions).filter(a => a.active).reduce((s, a) => s + parseFloat(a.amount || 0), 0);
      const subs = Object.values(adjustments.deductions).filter(a => a.active).reduce((s, a) => s + parseFloat(a.amount || 0), 0);
      return (baseTotal + adds - subs) * 0.01;
    }
    return 0;
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
    if (!item.totalValue) return alert("Por favor ingrese los datos del ítem y el valor total");
    if (simError) return alert("Por favor corrija el formato de la Posición SIM");
    
    const finalValue = getCalculatedValue();
    
    const activeAdds = Object.entries(adjustments.additions)
      .filter(([_, val]) => val.active && val.amount)
      .map(([key, val]) => ({ ...adjustmentQuestions.find(q => q.id === key), amount: val.amount }));

    const activeSubs = Object.entries(adjustments.deductions)
      .filter(([_, val]) => val.active && val.amount)
      .map(([key, val]) => ({ ...adjustmentQuestions.find(q => q.id === key), amount: val.amount }));

    onCalculate({ 
      finalValue,
      blocks: formData,
      summary: {
        exporter: header.exporterName,
        importer: header.importerName,
        ncm: item.ncmCode,
        incoterm: transaction.incoterm,
        currency: transaction.currency
      }
    });
  };

  const handleNcmSelect = (node) => {
    updateSection('item', 'ncmCode', node.code);
    updateSection('item', 'description', node.name);
    setIsNcmModalOpen(false);
  };

  // AI VISION INTEGRATION: Placeholder for OCR/Invoice Extraction
  const handleAiPreFill = (extractedData) => {
    setFormData(prev => ({
      ...prev,
      ...extractedData
    }));
  };

  return (
    <form className="valuation-form fade-in" onSubmit={handleSubmit}>
      
      {/* BLOQUE A: CABECERA */}
      <section className="form-block official-paper">
        <div className="block-header">
          <span className="block-tag">BLOQUE A</span>
          <h3>IDENTIFICACIÓN Y CABECERA</h3>
          <div className="header-actions">
            <div className="user-type-toggle">
              <button 
                type="button"
                className={header.userType === 'EXPORTADOR' ? 'active' : ''} 
                onClick={() => updateSection('header', 'userType', 'EXPORTADOR')}
              >EXPORTADOR</button>
              <button 
                type="button"
                className={header.userType === 'IMPORTADOR' ? 'active' : ''} 
                onClick={() => updateSection('header', 'userType', 'IMPORTADOR')}
              >IMPORTADOR</button>
            </div>
            <button type="button" onClick={loadExample} className="btn-ghost" style={{marginLeft: '10px'}}>Ejemplo</button>
            <button type="button" onClick={clearForm} className="btn-ghost">Limpiar</button>
          </div>
        </div>

        <div className="official-grid">
          <div className="official-cell span-8">
            <label>1. {header.userType} (RAZÓN SOCIAL)</label>
            <input 
              type="text" 
              value={header.exporterName}
              onChange={(e) => updateSection('header', 'exporterName', e.target.value)}
              placeholder="Nombre Legal"
            />
          </div>
          <div className="official-cell span-4">
            <label>ID FISCAL</label>
            <input 
              type="text" 
              value={header.exporterTaxId}
              onChange={(e) => updateSection('header', 'exporterTaxId', e.target.value)}
              placeholder="CUIT / NIF"
            />
          </div>
          
          <div className="official-cell span-8">
            <label>2. {header.userType === 'EXPORTADOR' ? 'CLIENTE EXTRANJERO' : 'PROVEEDOR EXTRANJERO'}</label>
            <input 
              type="text" 
              value={header.importerName}
              onChange={(e) => updateSection('header', 'importerName', e.target.value)}
              placeholder="Razón Social"
            />
          </div>
          <div className="official-cell span-4">
            <label>PAÍS / JURISDICCIÓN / TERRITORIO ADUANERO</label>
            <input 
              type="text" 
              value={header.importerDetails}
              onChange={(e) => updateSection('header', 'importerDetails', e.target.value)}
              placeholder="Ej: Brasil"
            />
          </div>

          <div className="official-cell span-5">
            <label>3. VÍA DE TRANSPORTE</label>
            <select 
              value={header.transportMode} 
              onChange={(e) => updateSection('header', 'transportMode', e.target.value)}
            >
              <option value="Terrestre">Terrestre</option>
              <option value="Acuática">Acuática (Marítimo/Fluvial)</option>
              <option value="Aérea">Aérea</option>
            </select>
          </div>

          <div className="official-cell span-4">
            <label>{getTransportDocLabel(header.transportMode)}</label>
            <input 
              type="text" 
              value={header.transportDocument}
              onChange={(e) => updateSection('header', 'transportDocument', e.target.value)}
              placeholder="Código Documento"
            />
          </div>

          <div className="official-cell span-3">
            <label>PRESENCIA</label>
            <div className="presence-toggle">
               <button 
                 type="button" 
                 className={header.presence === 'SI' ? 'active' : ''} 
                 onClick={() => updateSection('header', 'presence', 'SI')}
               >SI</button>
               <button 
                 type="button" 
                 className={header.presence === 'NO' ? 'active' : ''} 
                 onClick={() => updateSection('header', 'presence', 'NO')}
               >NO</button>
            </div>
          </div>

          <div className="official-cell span-6">
            <label>4. PASO FRONTERIZO / ADUANA</label>
            <input 
              type="text" 
              value={header.borderCrossing}
              onChange={(e) => updateSection('header', 'borderCrossing', e.target.value)}
              placeholder="Nombre del Paso"
            />
          </div>

          <div className="official-cell span-6">
            <label>5. AEROPUERTOS / DEPÓSITOS</label>
            <div className="input-with-action">
              <select 
                value={header.airport} 
                onChange={(e) => updateSection('header', 'airport', e.target.value)}
                style={{flex: 1}}
              >
                <option value="">Seleccionar...</option>
                {['EZE', 'AEP', 'COR', 'MDZ', 'SLA', 'IGR', 'BRC', 'ROS', 'Otros'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {header.airport === 'Otros' && (
                <input 
                  type="text" 
                  value={header.airportOther}
                  onChange={(e) => updateSection('header', 'airportOther', e.target.value)}
                  placeholder="Especificar..."
                  style={{borderLeft: '1px solid #eee', paddingLeft: '10px'}}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* BLOQUE B: CONDICIONES */}
      <section className="form-block official-paper">
        <div className="block-header">
          <span className="block-tag">BLOQUE B</span>
          <h3>CONDICIONES DE LA TRANSACCIÓN</h3>
        </div>
        <div className="official-grid">
          <div className="official-cell span-4">
            <label>6. MONEDA DE FACTURACIÓN</label>
            <select value={transaction.currency} onChange={(e) => updateSection('transaction', 'currency', e.target.value)}>
              <option value="USD">USD - Dólar Estadounidense</option>
              <option value="EUR">EUR - Euro</option>
              <option value="ARS">ARS - Peso Argentino</option>
              <option value="BRL">BRL - Real Brasileño</option>
              <option value="PYG">PYG - Guaraní Paraguayo</option>
              <option value="CLP">CLP - Peso Chileno</option>
              <option value="UYU">UYU - Peso Uruguayo</option>
            </select>
          </div>
          <div className="official-cell span-4">
            <label>7. INCOTERM</label>
            <select value={transaction.incoterm} onChange={(e) => updateSection('transaction', 'incoterm', e.target.value)}>
              {incoterms.map(i => (
                <option key={i.code} value={i.code}>{i.code} - {i.name}</option>
              ))}
            </select>
          </div>
          <div className="official-cell span-4">
            <label>8. LUGAR DE EMBARQUE</label>
            <input 
              type="text" 
              value={transaction.loadingPlace}
              onChange={(e) => updateSection('transaction', 'loadingPlace', e.target.value)}
              placeholder="Ej: Puerto Buenos Aires"
            />
          </div>
        </div>
      </section>

      {/* BLOQUE C: EL ÍTEM */}
      <section className="form-block official-paper">
        <div className="block-header">
          <span className="block-tag">BLOQUE C</span>
          <h3>DETALLE DE LA MERCADERÍA (SIM)</h3>
        </div>
        <div className="official-grid">
          <div className="official-cell span-4">
            <label>9. POSICIÓN ARANCELARIA A NIVEL SIM</label>
            <div className="input-with-action">
              <input 
                type="text" 
                value={item.ncmCode}
                onChange={(e) => {
                  updateSection('item', 'ncmCode', e.target.value.toUpperCase());
                  validateSimFormat(e.target.value.toUpperCase());
                }}
                placeholder="XXXX.XX.XX.XXXA"
                className={simError ? 'error-input' : ''}
              />
            </div>
            {simError && <span className="error-text">{simError}</span>}
          </div>
          <div className="official-cell span-2">
            <label>CANTIDAD</label>
            <input type="number" value={item.quantity} onChange={(e) => updateSection('item', 'quantity', e.target.value)} />
          </div>
          <div className="official-cell span-2">
            <label>UNIDAD</label>
            <input type="text" value={item.unit} onChange={(e) => updateSection('item', 'unit', e.target.value)} placeholder="Ej: UN" />
          </div>
          <div className="official-cell span-2">
            <label>VALOR UNIT.</label>
            <div className="currency-input-wrapper">
              <span className="ccy-tag">{getCurrencySymbol(transaction.currency)}</span>
              <input type="number" value={item.unitValue} onChange={(e) => updateSection('item', 'unitValue', e.target.value)} />
            </div>
          </div>
          <div className="official-cell span-2 highlight">
            <label>TOTAL ÍTEM</label>
            <div className="currency-input-wrapper">
              <span className="ccy-tag">{getCurrencySymbol(transaction.currency)}</span>
              <input type="number" value={item.totalValue} onChange={(e) => updateSection('item', 'totalValue', e.target.value)} className="bold-input" />
            </div>
          </div>
          <div className="official-cell span-12">
            <label>11. DESCRIPCIÓN COMERCIAL DE LA MERCADERÍA</label>
            <textarea 
              rows="3"
              value={item.description}
              onChange={(e) => updateSection('item', 'description', e.target.value)}
              placeholder="Indicar marcas, modelos, y especificaciones técnicas..."
            />
          </div>
        </div>
      </section>

      {/* BLOQUE D: AJUSTES */}
      <section className="form-block official-paper">
        <div className="block-header">
          <span className="block-tag">BLOQUE D</span>
          <h3>AJUSTES AL VALOR (ART. 8)</h3>
          <p className="block-info">Conceptos a incluir o deducir para llegar al Valor Imponible.</p>
        </div>
        
        <div className="adjustments-container">
          <div className="adjustment-column">
            <span className="col-label addition">ADICIONES (A INCLUIR)</span>
            <div className="adjustment-list">
              {adjustmentQuestions.filter(q => q.type === 'addition').map(q => {
                const isHighlighted = (transaction.incoterm === 'EXW' || transaction.incoterm === 'FCA') && (q.id === 'inland_freight' || q.id === 'packaging_expo');
                return (
                  <div key={q.id} className={`adj-item ${adjustments.additions[q.id]?.active ? 'active' : ''} ${isHighlighted ? 'highlighted' : ''}`}>
                    <div className="adj-row" onClick={() => handleAdjustmentToggle('addition', q.id)}>
                      <div className="adj-check">{adjustments.additions[q.id]?.active ? '✓' : ''}</div>
                      <span className="adj-text">{q.text}</span>
                    </div>
                    {adjustments.additions[q.id]?.active && (
                      <div className="adj-input-row slide-down">
                        <span className="adj-currency">{transaction.currency}</span>
                        <input 
                          type="number" 
                          value={adjustments.additions[q.id]?.amount || ''} 
                          onChange={(e) => handleAdjustmentAmount('addition', q.id, e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="adjustment-column">
            <span className="col-label deduction">DEDUCCIONES (A RESTAR)</span>
            <div className="adjustment-list">
              {adjustmentQuestions.filter(q => q.type === 'deduction').map(q => (
                <div key={q.id} className={`adj-item ${adjustments.deductions[q.id]?.active ? 'active' : ''}`}>
                  <div className="adj-row" onClick={() => handleAdjustmentToggle('deduction', q.id)}>
                    <div className="adj-check">{adjustments.deductions[q.id]?.active ? '✓' : ''}</div>
                    <span className="adj-text">{q.text}</span>
                  </div>
                  {adjustments.deductions[q.id]?.active && (
                    <div className="adj-input-row slide-down">
                      <span className="adj-currency">{transaction.currency}</span>
                      <input 
                        type="number" 
                        value={adjustments.deductions[q.id]?.amount || ''} 
                        onChange={(e) => handleAdjustmentAmount('deduction', q.id, e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENTACIÓN ADJUNTA */}
      <section className="form-block official-paper">
        <div className="block-header">
          <span className="block-tag">DOCS</span>
          <h3>DOCUMENTACIÓN ADJUNTA</h3>
        </div>
        <div className="official-grid">
          <div className="official-cell span-4">
             <label>CERTIFICADO DE ORIGEN (cod)</label>
             <div className="presence-toggle">
               <button 
                 type="button" 
                 className={documentation.originCertificateAttached === 'SI' ? 'active' : ''} 
                 onClick={() => updateSection('documentation', 'originCertificateAttached', 'SI')}
               >SI</button>
               <button 
                 type="button" 
                 className={documentation.originCertificateAttached === 'NO' ? 'active' : ''} 
                 onClick={() => updateSection('documentation', 'originCertificateAttached', 'NO')}
               >NO</button>
            </div>
          </div>
          <div className="official-cell span-8">
            <label>DETALLE CERTIFICADO / ESTADO</label>
            {documentation.originCertificateAttached === 'SI' ? (
              <input 
                type="text" 
                value={documentation.originCertificate} 
                onChange={(e) => updateSection('documentation', 'originCertificate', e.target.value)} 
                placeholder="Número de Certificado"
              />
            ) : (
              <div className="fine-warning">
                <span className="fine-label">A GARANTIZAR</span>
                <span className="fine-value">Multa Estimada (1%): {transaction.currency} {getFineAmount().toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="official-cell span-4">
            <label>NRO. FACTURA (PROFORMA/LEGAL)</label>
            <input type="text" value={documentation.invoiceNumber} onChange={(e) => updateSection('documentation', 'invoiceNumber', e.target.value)} />
          </div>
          <div className="official-cell span-4">
            <label>CONTRATO DE SEGURO</label>
            <input type="text" value={documentation.insuranceContract} onChange={(e) => updateSection('documentation', 'insuranceContract', e.target.value)} />
          </div>
          <div className="official-cell span-4">
            <label>CONTRATO DE FLETE</label>
            <input type="text" value={documentation.freightContract} onChange={(e) => updateSection('documentation', 'freightContract', e.target.value)} />
          </div>
        </div>
      </section>

      <div className="valuation-footer">
        <div className="total-display">
          <span>VALOR EN ADUANA TOTAL DECLARADO:</span>
          <span className="grand-total">{transaction.currency} {getCalculatedValue().toLocaleString()}</span>
        </div>
        <button type="submit" className="btn-official-large">
          GENERAR DECLARACIÓN DE VALOR
        </button>
      </div>
    </form>
  );
};

export default ValuationForm;
