import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { adjustmentQuestions } from '../data/valuationLogic';
import { incoterms } from '../data/incotermsLogic';
import { ChevronDown, ChevronUp } from 'lucide-react';
import OcrDropzone from './OcrDropzone';
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
      presence: null,
      airport: '',
      airportCategory: '', // 'AERO' | 'PUERTO' | 'OTROS'
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
      originCertificateAttached: null,
      originCertificate: '',
      invoiceNumber: '',
      insuranceContract: '',
      freightContract: '',
    }
  });

  const [simError, setSimError] = useState('');
  const [highlightedFields, setHighlightedFields] = useState({}); // { 'header.exporterName': true, ... }
  
  // Collapse state for sections - Persisted in localStorage
  const [collapsed, setCollapsed] = useLocalStorage('valuation_collapse_v1', {
    header: false,
    transaction: true,
    item: true,
    adjustments: true,
    documentation: true
  });

  const toggleCollapse = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const { header, transaction, item, adjustments, documentation } = formData;

  const updateSection = (section, field, value, isFromOcr = false) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
    
    if (isFromOcr) {
      const fieldKey = `${section}.${field}`;
      setHighlightedFields(prev => ({ ...prev, [fieldKey]: true }));
      // Clear highlight after 5 seconds
      setTimeout(() => {
        setHighlightedFields(prev => {
          const newHighlights = { ...prev };
          delete newHighlights[fieldKey];
          return newHighlights;
        });
      }, 5000);
    }
  };

  const handleAdjustmentSelection = (type, id, selection) => {
    const list = type === 'addition' ? 'additions' : 'deductions';
    setFormData(prev => ({
      ...prev,
      adjustments: {
        ...prev.adjustments,
        [list]: { 
          ...prev.adjustments[list], 
          [id]: { 
            status: selection, 
            amount: selection === 'SI' ? (prev.adjustments[list][id]?.amount || '') : '' 
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
      header: { userType: 'EXPORTADOR', exporterName: '', exporterTaxId: '', importerName: '', importerDetails: '', transportDocument: '', transportMode: 'Terrestre', presence: null, airportCategory: '', airport: '', airportOther: '', borderCrossing: '' },
      transaction: { currency: 'USD', incoterm: 'FOB', loadingPlace: '' },
      item: { ncmCode: '', quantity: '', unit: '', unitValue: '', totalValue: '', description: '' },
      adjustments: { additions: {}, deductions: {} },
      documentation: { originCertificateAttached: null, originCertificate: '', invoiceNumber: '', insuranceContract: '', freightContract: '' }
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
    const simRegex = /^\d{4}\.\d{2}\.\d{2}\.\d{3}[A-Z]$/;
    if (value && !simRegex.test(value)) {
      setSimError('Formato SIM inválido (XXXX.XX.XX.XXXA)');
    } else {
      setSimError('');
    }
  };

  const getCalculatedValue = () => {
    const base = parseFloat(item.totalValue || 0);
    const adds = Object.values(adjustments.additions).filter(a => a.status === 'SI').reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
    const subs = Object.values(adjustments.deductions).filter(a => a.status === 'SI').reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
    let total = base + adds - subs;
    if (documentation.originCertificateAttached === 'NO') {
      const fine = total * 0.01;
      total += fine;
    }
    return total;
  };

  const getFineAmount = () => {
    if (documentation.originCertificateAttached === 'NO') {
      const baseTotal = parseFloat(item.totalValue || 0);
      const adds = Object.values(adjustments.additions).filter(a => a.status === 'SI').reduce((s, a) => s + parseFloat(a.amount || 0), 0);
      const subs = Object.values(adjustments.deductions).filter(a => a.status === 'SI').reduce((s, a) => s + parseFloat(a.amount || 0), 0);
      return (baseTotal + adds - subs) * 0.01;
    }
    return 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mandatory Validations
    if (!item.totalValue) return alert("Error: Debe ingresar el valor total del ítem.");
    if (simError) return alert("Error: Formato de Posición SIM incorrecto.");
    if (header.presence === null) return alert("Obligatorio: Debe aclarar la PRESENCIA (SI/NO) en Bloque A.");
    if (documentation.originCertificateAttached === null) return alert("Obligatorio: Debe aclarar el CERTIFICADO DE ORIGEN (SI/NO) en Bloque DOCS.");
    
    // Validate all Adjustments
    const missingAdds = adjustmentQuestions.filter(q => q.type === 'addition').some(q => !adjustments.additions[q.id] || adjustments.additions[q.id].status === null);
    const missingSubs = adjustmentQuestions.filter(q => q.type === 'deduction').some(q => !adjustments.deductions[q.id] || adjustments.deductions[q.id].status === null);
    
    if (missingAdds || missingSubs) {
      return alert("Obligatorio: Todos los AJUSTES del Bloque D deben ser respondidos expresamente con SI o NO.");
    }

    onCalculate({ 
      finalValue: getCalculatedValue(),
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

  // AI OCR DATA MAPPING
  const handleOcrData = (extractedData) => {
    if (extractedData.header) {
      Object.entries(extractedData.header).forEach(([field, value]) => updateSection('header', field, value, true));
    }
    if (extractedData.transaction) {
      Object.entries(extractedData.transaction).forEach(([field, value]) => updateSection('transaction', field, value, true));
    }
    if (extractedData.item) {
      Object.entries(extractedData.item).forEach(([field, value]) => updateSection('item', field, value, true));
      if (extractedData.item.ncmCode) validateSimFormat(extractedData.item.ncmCode);
    }
    if (extractedData.documentation) {
       Object.entries(extractedData.documentation).forEach(([field, value]) => updateSection('documentation', field, value, true));
    }
    
    // specialized CIF/CIP logic
    if ((extractedData.transaction?.incoterm === 'CIF' || extractedData.transaction?.incoterm === 'CIP') && extractedData.adjustments?.additions) {
      Object.entries(extractedData.adjustments.additions).forEach(([id, data]) => {
        setFormData(prev => ({
          ...prev,
          adjustments: { 
            ...prev.adjustments, 
            additions: { ...prev.adjustments.additions, [id]: { active: true, amount: data.amount } } 
          }
        }));
        const fieldKey = `adjustments.additions.${id}`;
        setHighlightedFields(prev => ({ ...prev, [fieldKey]: true }));
        setTimeout(() => {
          setHighlightedFields(prev => {
            const next = {...prev};
            delete next[fieldKey];
            return next;
          });
        }, 5000);
      });
    }
  };

  const isHighlighted = (section, field) => highlightedFields[`${section}.${field}`] ? 'highlighted-fill' : '';

  return (
    <div className="valuation-form fade-in">
      
      {/* OCR Dropzone hidden for Manual Mode */}
      {/* <OcrDropzone onDataExtracted={handleOcrData} /> */}

      <form onSubmit={handleSubmit}>
        
        {/* BLOQUE A: CABECERA */}
        <section className={`form-block official-paper ${collapsed.header ? 'is-collapsed' : ''}`}>
          <div className="block-header clickable" onClick={() => toggleCollapse('header')}>
            <span className="block-tag">BLOQUE A [V 1.25.1]</span>
            <h3>IDENTIFICACIÓN Y CABECERA</h3>
            <div className="collapse-icon">
              {collapsed.header ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
            <div className="header-actions" onClick={(e) => e.stopPropagation()}>
              <div className="si-no-selector" style={{minWidth: '220px'}}>
                <button type="button" className={`btn-si-no ${header.userType === 'EXPORTADOR' ? 'si-active' : ''}`} onClick={() => updateSection('header', 'userType', 'EXPORTADOR')}>EXPORTADOR</button>
                <button type="button" className={`btn-si-no ${header.userType === 'IMPORTADOR' ? 'no-active' : ''}`} onClick={() => updateSection('header', 'userType', 'IMPORTADOR')}>IMPORTADOR</button>
              </div>
              <button type="button" onClick={loadExample} className="btn-ghost" style={{marginLeft: '10px'}}>Ejemplo</button>
              <button type="button" onClick={clearForm} className="btn-ghost" style={{marginLeft: '5px'}}>Limpiar</button>
            </div>
          </div>

          <div className="official-grid">
            <div className={`official-cell span-8 ${isHighlighted('header', 'exporterName')}`}>
              <label>1. {header.userType} (RAZÓN SOCIAL)</label>
              <input type="text" value={header.exporterName} onChange={(e) => updateSection('header', 'exporterName', e.target.value)} placeholder="Nombre Legal" />
            </div>
            <div className={`official-cell span-4 ${isHighlighted('header', 'exporterTaxId')}`}>
              <label>ID FISCAL</label>
              <input type="text" value={header.exporterTaxId} onChange={(e) => updateSection('header', 'exporterTaxId', e.target.value)} placeholder="CUIT / NIF" />
            </div>
            
            <div className={`official-cell span-8 ${isHighlighted('header', 'importerName')}`}>
              <label>2. {header.userType === 'EXPORTADOR' ? 'CLIENTE EXTRANJERO' : 'PROVEEDOR EXTRANJERO'}</label>
              <input type="text" value={header.importerName} onChange={(e) => updateSection('header', 'importerName', e.target.value)} placeholder="Razón Social" />
            </div>
            <div className={`official-cell span-4 ${isHighlighted('header', 'importerDetails')}`}>
              <label>PAÍS / JURISDICCIÓN / TERRITORIO ADUANERO</label>
              <input type="text" value={header.importerDetails} onChange={(e) => updateSection('header', 'importerDetails', e.target.value)} placeholder="Ej: Brasil" />
            </div>

            <div className={`official-cell span-5 ${isHighlighted('header', 'transportMode')}`}>
              <label>3. VÍA DE TRANSPORTE</label>
              <select value={header.transportMode} onChange={(e) => updateSection('header', 'transportMode', e.target.value)}>
                <option value="Terrestre">Terrestre</option>
                <option value="Acuática">Acuática (Marítimo/Fluvial)</option>
                <option value="Aérea">Aérea</option>
              </select>
            </div>

            <div className={`official-cell span-4 ${isHighlighted('header', 'transportDocument')}`}>
              <label>{getTransportDocLabel(header.transportMode)}</label>
              <input type="text" value={header.transportDocument} onChange={(e) => updateSection('header', 'transportDocument', e.target.value)} placeholder="Código Documento" />
            </div>

            <div className={`official-cell span-3 ${isHighlighted('header', 'presence')}`}>
              <label>PRESENCIA</label>
              <div className="si-no-selector">
                 <button type="button" className={`btn-si-no ${header.presence === 'SI' ? 'si-active' : ''}`} onClick={() => updateSection('header', 'presence', 'SI')}>SI</button>
                 <button type="button" className={`btn-si-no ${header.presence === 'NO' ? 'no-active' : ''}`} onClick={() => updateSection('header', 'presence', 'NO')}>NO</button>
              </div>
            </div>

            <div className={`official-cell span-6 ${isHighlighted('header', 'borderCrossing')}`}>
              <label>4. PASO FRONTERIZO / ADUANA</label>
              <input type="text" value={header.borderCrossing} onChange={(e) => updateSection('header', 'borderCrossing', e.target.value)} placeholder="Nombre del Paso" />
            </div>

            <div className={`official-cell span-6 ${isHighlighted('header', 'airport')}`}>
              <label>5. PUERTO / AEROPUERTO</label>
              <div className="terminal-selector-container">
                {header.airportCategory === '' ? (
                  <select 
                    value={header.airportCategory} 
                    onChange={(e) => updateSection('header', 'airportCategory', e.target.value)} 
                    className="premium-select primary-select"
                  >
                    <option value="">Seleccionar Tipo de Terminal...</option>
                    <option value="AERO">✈ AEROPUERTOS INTERNACIONALES</option>
                    <option value="PUERTO">⚓ PUERTOS NACIONALES</option>
                    <option value="OTROS">⚙ OTRAS TERMINALES / DEPÓSITOS</option>
                  </select>
                ) : header.airportCategory === 'AERO' ? (
                  <div className="input-with-action">
                    <select 
                      value={header.airport} 
                      onChange={(e) => updateSection('header', 'airport', e.target.value)} 
                      className="premium-select"
                    >
                      <option value="">Seleccionar Aeropuerto...</option>
                      <option value="EZE">Aeropuerto de Ezeiza (EZE)</option>
                      <option value="AEP">Aeroparque Jorge Newbery (AEP)</option>
                      <option value="COR">Aeropuerto de Córdoba (COR)</option>
                      <option value="MDZ">Aeropuerto de Mendoza (MDZ)</option>
                      <option value="SLA">Aeropuerto de Salta (SLA)</option>
                      <option value="IGR">Aeropuerto de Iguazú (IGR)</option>
                      <option value="BRC">Aeropuerto de Bariloche (BRC)</option>
                      <option value="ROS">Aeropuerto de Rosario (ROS)</option>
                    </select>
                    <button type="button" className="btn-back-selector" onClick={() => { updateSection('header', 'airportCategory', ''); updateSection('header', 'airport', ''); }}>✕</button>
                  </div>
                ) : header.airportCategory === 'PUERTO' ? (
                  <div className="input-with-action">
                    <select 
                      value={header.airport} 
                      onChange={(e) => updateSection('header', 'airport', e.target.value)} 
                      className="premium-select"
                    >
                      <option value="">Seleccionar Puerto...</option>
                      <option value="BUE">Puerto de Buenos Aires (BUE)</option>
                      <option value="DSU">Puerto de Dock Sud (DSU)</option>
                      <option value="CMP">Puerto de Campana (CMP)</option>
                      <option value="ZAR">Puerto de Zárate (ZAR)</option>
                      <option value="ROS">Puerto de Rosario (ROS)</option>
                      <option value="SLO">Puerto de San Lorenzo (SLO)</option>
                      <option value="BBI">Puerto de Bahía Blanca (BBI)</option>
                      <option value="PMY">Puerto de Puerto Madryn (PMY)</option>
                      <option value="USH">Puerto de Ushuaia (USH)</option>
                      <option value="QUE">Puerto de Quequén (QUE)</option>
                      <option value="SAO">Puerto de San Antonio Este (SAO)</option>
                      <option value="CRV">Puerto de Comodoro Rivadavia (CRV)</option>
                      <option value="VCO">Puerto de Villa Constitución (VCO)</option>
                      <option value="SFE">Puerto de Santa Fe (SFE)</option>
                      <option value="COR">Puerto de Corrientes (COR)</option>
                      <option value="SNI">Puerto de San Nicolás (SNI)</option>
                      <option value="PSS">Puerto de Posadas (PSS)</option>
                    </select>
                    <button type="button" className="btn-back-selector" onClick={() => { updateSection('header', 'airportCategory', ''); updateSection('header', 'airport', ''); }}>✕</button>
                  </div>
                ) : (
                  <div className="input-with-action">
                    <input 
                      type="text" 
                      value={header.airportOther} 
                      onChange={(e) => updateSection('header', 'airportOther', e.target.value)} 
                      placeholder="Nombre de Terminal / Depósito Fiscal..." 
                      className="premium-input-manual"
                      autoFocus
                    />
                    <button type="button" className="btn-back-selector" onClick={() => { updateSection('header', 'airportCategory', ''); updateSection('header', 'airportOther', ''); }}>✕</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="block-separator"></div>

        {/* BLOQUE B: CONDICIONES */}
        <section className={`form-block official-paper ${collapsed.transaction ? 'is-collapsed' : ''}`}>
          <div className="block-header clickable" onClick={() => toggleCollapse('transaction')}>
            <span className="block-tag">BLOQUE B</span>
            <h3>CONDICIONES DE LA TRANSACCIÓN</h3>
            <div className="collapse-icon">
              {collapsed.transaction ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
          </div>
          <div className="official-grid">
            <div className={`official-cell span-4 ${isHighlighted('transaction', 'currency')}`}>
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
            <div className={`official-cell span-4 ${isHighlighted('transaction', 'incoterm')}`}>
              <label>7. INCOTERM</label>
              <select value={transaction.incoterm} onChange={(e) => updateSection('transaction', 'incoterm', e.target.value)}>
                {incoterms.map(i => (
                  <option key={i.code} value={i.code}>{i.code} - {i.name}</option>
                ))}
              </select>
            </div>
            <div className={`official-cell span-4 ${isHighlighted('transaction', 'loadingPlace')}`}>
              <label>8. LUGAR DE EMBARQUE</label>
              <input type="text" value={transaction.loadingPlace} onChange={(e) => updateSection('transaction', 'loadingPlace', e.target.value)} placeholder="Ej: Puerto Buenos Aires" />
            </div>
          </div>
        </section>

        <div className="block-separator"></div>

        {/* BLOQUE C: EL ÍTEM */}
        <section className={`form-block official-paper ${collapsed.item ? 'is-collapsed' : ''}`}>
          <div className="block-header clickable" onClick={() => toggleCollapse('item')}>
            <span className="block-tag">BLOQUE C</span>
            <h3>DETALLE DE LA MERCADERÍA (SIM)</h3>
            <div className="collapse-icon">
              {collapsed.item ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
          </div>
          <div className="official-grid">
            <div className={`official-cell span-4 ${isHighlighted('item', 'ncmCode')}`}>
              <label>9. POSICIÓN ARANCELARIA A NIVEL SIM</label>
              <input type="text" value={item.ncmCode} onChange={(e) => { updateSection('item', 'ncmCode', e.target.value.toUpperCase()); validateSimFormat(e.target.value.toUpperCase()); }} placeholder="XXXX.XX.XX.XXXA" className={simError ? 'error-input' : ''} />
              {simError && <span className="error-text">{simError}</span>}
            </div>
            <div className={`official-cell span-2 ${isHighlighted('item', 'quantity')}`}>
              <label>CANTIDAD</label>
              <input type="number" value={item.quantity} onChange={(e) => updateSection('item', 'quantity', e.target.value)} />
            </div>
            <div className={`official-cell span-2 ${isHighlighted('item', 'unit')}`}>
              <label>UNIDAD</label>
              <input type="text" value={item.unit} onChange={(e) => updateSection('item', 'unit', e.target.value)} placeholder="Ej: UN" />
            </div>
            <div className={`official-cell span-2 ${isHighlighted('item', 'unitValue')}`}>
              <label>VALOR UNIT.</label>
              <div className="currency-input-wrapper">
                <span className="ccy-tag">{getCurrencySymbol(transaction.currency)}</span>
                <input type="number" value={item.unitValue} onChange={(e) => updateSection('item', 'unitValue', e.target.value)} />
              </div>
            </div>
            <div className={`official-cell span-2 highlight ${isHighlighted('item', 'totalValue')}`}>
              <label>TOTAL ÍTEM</label>
              <div className="currency-input-wrapper">
                <span className="ccy-tag">{getCurrencySymbol(transaction.currency)}</span>
                <input type="number" value={item.totalValue} onChange={(e) => updateSection('item', 'totalValue', e.target.value)} className="bold-input" />
              </div>
            </div>
            <div className={`official-cell span-12 ${isHighlighted('item', 'description')}`}>
              <label>11. DESCRIPCIÓN COMERCIAL</label>
              <textarea rows="3" value={item.description} onChange={(e) => updateSection('item', 'description', e.target.value)} placeholder="Indicar marcas, modelos, y especificaciones técnicas..." />
            </div>
          </div>
        </section>

        <div className="block-separator"></div>

        {/* BLOQUE D: AJUSTES */}
        <section className={`form-block official-paper ${collapsed.adjustments ? 'is-collapsed' : ''}`}>
          <div className="block-header clickable" onClick={() => toggleCollapse('adjustments')}>
            <span className="block-tag">BLOQUE D</span>
            <h3>AJUSTES AL VALOR (ART. 8)</h3>
            <div className="collapse-icon">
              {collapsed.adjustments ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
          </div>
          <div className="adjustments-container">
            <div className="adjustment-column">
              <span className="col-label addition">ADICIONES (A INCLUIR)</span>
              <div className="adjustment-list">
                {adjustmentQuestions.filter(q => q.type === 'addition').map(q => {
                  const status = adjustments.additions[q.id]?.status || null;
                  const isHighlightAdj = highlightedFields[`adjustments.additions.${q.id}`];
                  return (
                    <div key={q.id} className={`adj-item ${status === 'SI' ? 'active' : ''} ${isHighlightAdj ? 'highlighted-fill' : ''}`}>
                      <div className="adj-row-unified">
                        <span className="adj-text">{q.text}</span>
                        <div className="si-no-selector small">
                           <button type="button" className={`btn-si-no ${status === 'SI' ? 'si-active' : ''}`} onClick={() => handleAdjustmentSelection('addition', q.id, 'SI')}>SI</button>
                           <button type="button" className={`btn-si-no ${status === 'NO' ? 'no-active' : ''}`} onClick={() => handleAdjustmentSelection('addition', q.id, 'NO')}>NO</button>
                        </div>
                      </div>
                      {status === 'SI' && (
                        <div className="adj-input-row slide-down">
                          <span className="adj-currency">{transaction.currency}</span>
                          <input type="number" value={adjustments.additions[q.id]?.amount || ''} onChange={(e) => handleAdjustmentAmount('addition', q.id, e.target.value)} placeholder="0.00" />
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
                {adjustmentQuestions.filter(q => q.type === 'deduction').map(q => {
                  const status = adjustments.deductions[q.id]?.status || null;
                  return (
                    <div key={q.id} className={`adj-item ${status === 'SI' ? 'active' : ''}`}>
                      <div className="adj-row-unified">
                        <span className="adj-text">{q.text}</span>
                        <div className="si-no-selector small">
                           <button type="button" className={`btn-si-no ${status === 'SI' ? 'si-active' : ''}`} onClick={() => handleAdjustmentSelection('deduction', q.id, 'SI')}>SI</button>
                           <button type="button" className={`btn-si-no ${status === 'NO' ? 'no-active' : ''}`} onClick={() => handleAdjustmentSelection('deduction', q.id, 'NO')}>NO</button>
                        </div>
                      </div>
                      {status === 'SI' && (
                        <div className="adj-input-row slide-down">
                          <span className="adj-currency">{transaction.currency}</span>
                          <input type="number" value={adjustments.deductions[q.id]?.amount || ''} onChange={(e) => handleAdjustmentAmount('deduction', q.id, e.target.value)} placeholder="0.00" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="block-separator"></div>

        {/* DOCUMENTACIÓN ADJUNTA */}
        <section className={`form-block official-paper ${collapsed.documentation ? 'is-collapsed' : ''}`}>
          <div className="block-header clickable" onClick={() => toggleCollapse('documentation')}>
            <span className="block-tag">DOCS</span>
            <h3>DOCUMENTACIÓN ADJUNTA</h3>
            <div className="collapse-icon">
              {collapsed.documentation ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
          </div>
          <div className="official-grid">
            <div className={`official-cell span-4 ${isHighlighted('documentation', 'originCertificateAttached')}`}>
               <label>CERTIFICADO DE ORIGEN (REQUISITO)</label>
               <div className="si-no-selector">
                 <button type="button" className={`btn-si-no ${documentation.originCertificateAttached === 'SI' ? 'si-active' : ''}`} onClick={() => updateSection('documentation', 'originCertificateAttached', 'SI')}>SI</button>
                 <button type="button" className={`btn-si-no ${documentation.originCertificateAttached === 'NO' ? 'no-active' : ''}`} onClick={() => updateSection('documentation', 'originCertificateAttached', 'NO')}>NO</button>
              </div>
            </div>
            <div className={`official-cell span-8 ${isHighlighted('documentation', 'originCertificate')}`}>
              <label>DETALLE CERTIFICADO / ESTADO</label>
              {documentation.originCertificateAttached === 'SI' ? (
                <input type="text" value={documentation.originCertificate} onChange={(e) => updateSection('documentation', 'originCertificate', e.target.value)} placeholder="Número de Certificado" />
              ) : documentation.originCertificateAttached === 'NO' ? (
                <div className="fine-warning">
                  <span className="fine-label">A GARANTIZAR</span>
                  <span className="fine-value">Multa Estimada (1%): {transaction.currency} {getFineAmount().toLocaleString()}</span>
                </div>
              ) : (
                <div className="pending-selection">
                  <span className="pending-text">Seleccione SI/NO para determinar requisitos</span>
                </div>
              )}
            </div>
            <div className={`official-cell span-4 ${isHighlighted('documentation', 'invoiceNumber')}`}>
              <label>NRO. FACTURA (PROFORMA/LEGAL)</label>
              <input type="text" value={documentation.invoiceNumber} onChange={(e) => updateSection('documentation', 'invoiceNumber', e.target.value)} />
            </div>
            <div className={`official-cell span-4 ${isHighlighted('documentation', 'insuranceContract')}`}>
              <label>CONTRATO DE SEGURO</label>
              <input type="text" value={documentation.insuranceContract} onChange={(e) => updateSection('documentation', 'insuranceContract', e.target.value)} />
            </div>
            <div className={`official-cell span-4 ${isHighlighted('documentation', 'freightContract')}`}>
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
    </div>
  );
};

export default ValuationForm;
