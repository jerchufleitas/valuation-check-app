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
      airportCategory: '', // 'AERO' | 'PUERTO' | 'OTROS'
      airport: '',
      airportOther: '',
      customsCategory: '', // 'INTERIOR' | 'FRONTERA' | 'PUERTOS'
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
  
  // Terminal Data Constants
  const terminalData = {
    AERO: [
      { id: 'EZE', name: 'Ezeiza (EZE)' },
      { id: 'AEP', name: 'Aeroparque (AEP)' },
      { id: 'COR', name: 'Córdoba (COR)' },
      { id: 'MDZ', name: 'Mendoza (MDZ)' },
      { id: 'SLA', name: 'Salta (SLA)' },
      { id: 'IGR', name: 'Iguazú (IGR)' },
      { id: 'BRC', name: 'Bariloche (BRC)' },
      { id: 'ROS', name: 'Rosario (ROS)' }
    ],
    PUERTO: [
      { id: 'BUE', name: 'Buenos Aires (BUE)' },
      { id: 'DSU', name: 'Dock Sud (DSU)' },
      { id: 'CMP', name: 'Campana (CMP)' },
      { id: 'ZAR', name: 'Zárate (ZAR)' },
      { id: 'ROS', name: 'Puerto Rosario (ROS)' },
      { id: 'SLO', name: 'San Lorenzo (SLO)' },
      { id: 'BBI', name: 'Bahía Blanca (BBI)' },
      { id: 'PMY', name: 'Puerto Madryn (PMY)' },
      { id: 'USH', name: 'Ushuaia (USH)' },
      { id: 'QUE', name: 'Quequén (QUE)' },
      { id: 'SAO', name: 'San Antonio Este (SAO)' },
      { id: 'CRV', name: 'Comodoro Rivadavia (CRV)' },
      { id: 'VCO', name: 'Villa Constitución (VCO)' },
      { id: 'SFE', name: 'Santa Fe (SFE)' },
      { id: 'COR', name: 'Puerto Corrientes (COR)' },
      { id: 'SNI', name: 'San Nicolás (SNI)' },
      { id: 'PSS', name: 'Puerto Posadas (PSS)' }
    ]
  };

  const customsData = {
    INTERIOR: [
      { id: '001', name: 'BUENOS AIRES (001)' },
      { id: '017', name: 'CORDOBA (017)' },
      { id: '053', name: 'ROSARIO (053)' },
      { id: '038', name: 'MENDOZA (038)' },
      { id: '060', name: 'SALTA (060)' },
      { id: '071', name: 'TUCUMAN (071)' },
      { id: '101', name: 'EZEIZA (101)' },
      { id: '073', name: 'USHUAIA (073)' }
    ],
    FRONTERA: [
      { id: '012', name: 'CLORINDA (012)' },
      { id: '031', name: 'IGUAZU (031)' },
      { id: '041', name: 'PASO DE LOS LIBRES (041)' },
      { id: '048', name: 'POSADAS (048)' },
      { id: '033', name: 'LA QUIACA (033)' },
      { id: '024', name: 'FORMOSA (024)' },
      { id: '013', name: 'COLON (013)' },
      { id: '016', name: 'CONCORDIA (016)' },
      { id: '022', name: 'GUALEGUAYCHU (022)' },
      { id: '046', name: 'ORAN (046)' },
      { id: '066', name: 'SANTO TOME (066)' },
      { id: '045', name: 'NEUQUEN (045)' }
    ],
    PUERTOS: [
      { id: '003', name: 'BAHIA BLANCA (003)' },
      { id: '008', name: 'CAMPANA (008)' },
      { id: '091', name: 'ZARATE (091)' },
      { id: '054', name: 'SAN LORENZO (054)' },
      { id: '086', name: 'VILLA CONSTITUCION (086)' },
      { id: '037', name: 'MAR DEL PLATA (037)' },
      { id: '049', name: 'PUERTO MADRYN (049)' },
      { id: '056', name: 'SAN NICOLAS (056)' },
      { id: '057', name: 'SANTA FE (057)' }
    ]
  };

  const [searchTerm, setSearchTerm] = useState('');
  
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
      header: { userType: 'EXPORTADOR', exporterName: '', exporterTaxId: '', importerName: '', importerDetails: '', transportDocument: '', transportMode: 'Terrestre', presence: null, airportCategory: '', airport: '', airportOther: '', customsCategory: '', borderCrossing: '' },
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
              <div className="terminal-selector-container">
                {header.customsCategory === '' && header.borderCrossing === '' ? (
                  <div className="category-reveal-grid">
                    <button type="button" className="btn-category" onClick={() => updateSection('header', 'customsCategory', 'INTERIOR')}>
                      <span className="icon">🏦</span>
                      <span className="label">INTERIOR / METRO</span>
                    </button>
                    <button type="button" className="btn-category" onClick={() => updateSection('header', 'customsCategory', 'FRONTERA')}>
                      <span className="icon">🛂</span>
                      <span className="label">FRONTERIZAS</span>
                    </button>
                    <button type="button" className="btn-category" onClick={() => updateSection('header', 'customsCategory', 'PUERTOS')}>
                      <span className="icon">🚢</span>
                      <span className="label">ZONA PORTUARIA</span>
                    </button>
                  </div>
                ) : header.customsCategory !== '' && header.borderCrossing === '' ? (
                  <div className="terminal-reveal-panel slide-down">
                    <div className="reveal-header">
                       <span className="reveal-title">
                         {header.customsCategory === 'INTERIOR' ? 'ADUANAS DE INTERIOR' : 
                          header.customsCategory === 'FRONTERA' ? 'ADUANAS DE FRONTERA' : 'ADUANAS PORTUARIAS'}
                       </span>
                       <button type="button" className="btn-back-link" onClick={() => updateSection('header', 'customsCategory', '')}>← VOLVER</button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Buscar por código o nombre..." 
                      className="reveal-search" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      autoFocus
                    />
                    <div className="options-grid">
                      {customsData[header.customsCategory]
                        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(c => (
                          <button key={c.id} type="button" className="btn-option-card" onClick={() => { updateSection('header', 'borderCrossing', c.name); updateSection('header', 'customsCategory', ''); setSearchTerm(''); }}>
                            <span className="opt-id">{c.id}</span>
                            <span className="opt-name">{c.name.split(' (')[0]}</span>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                ) : (
                  <div className="selection-active-badge slide-down">
                    <div className="badge-content">
                      <span className="badge-icon">🏛️</span>
                      <span className="badge-text">{header.borderCrossing}</span>
                    </div>
                    <button type="button" className="btn-clear-badge" onClick={() => { updateSection('header', 'borderCrossing', ''); updateSection('header', 'customsCategory', ''); }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={`official-cell span-6 ${isHighlighted('header', 'airport')}`}>
              <label>5. PUERTO / AEROPUERTO</label>
              <div className="terminal-selector-container">
                {header.airportCategory === '' ? (
                  <div className="category-reveal-grid">
                    <button type="button" className="btn-category" onClick={() => updateSection('header', 'airportCategory', 'AERO')}>
                      <span className="icon">✈</span>
                      <span className="label">AEROPUERTOS INTERNACIONALES</span>
                    </button>
                    <button type="button" className="btn-category" onClick={() => updateSection('header', 'airportCategory', 'PUERTO')}>
                      <span className="icon">⚓</span>
                      <span className="label">PUERTOS NACIONALES</span>
                    </button>
                    <button type="button" className="btn-category" onClick={() => updateSection('header', 'airportCategory', 'OTROS')}>
                      <span className="icon">⚙</span>
                      <span className="label">OTROS</span>
                    </button>
                  </div>
                ) : (header.airportCategory === 'AERO' || header.airportCategory === 'PUERTO') && header.airport === '' ? (
                  <div className="terminal-reveal-panel slide-down">
                    <div className="reveal-header">
                       <span className="reveal-title">{header.airportCategory === 'AERO' ? 'SELECCIONAR AEROPUERTO' : 'SELECCIONAR PUERTO'}</span>
                       <button type="button" className="btn-back-link" onClick={() => updateSection('header', 'airportCategory', '')}>← VOLVER</button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Buscar..." 
                      className="reveal-search" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      autoFocus
                    />
                    <div className="options-grid">
                      {terminalData[header.airportCategory]
                        .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(t => (
                          <button key={t.id} type="button" className="btn-option-card" onClick={() => { updateSection('header', 'airport', t.id); setSearchTerm(''); }}>
                            <span className="opt-id">{t.id}</span>
                            <span className="opt-name">{t.name}</span>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                ) : header.airportCategory === 'OTROS' && header.airportOther === '' ? (
                  <div className="input-with-action slide-down">
                     <input 
                        type="text" 
                        placeholder="Especificar Terminal / Depósito..." 
                        className="premium-input-manual"
                        onChange={(e) => updateSection('header', 'airportOther', e.target.value)}
                        autoFocus
                     />
                     <button type="button" className="btn-back-selector" onClick={() => updateSection('header', 'airportCategory', '')}>✕</button>
                  </div>
                ) : (
                  <div className="selection-active-badge slide-down">
                    <div className="badge-info">
                       <span className="badge-cat">{header.airportCategory === 'AERO' ? '✈ AEROPUERTO' : header.airportCategory === 'PUERTO' ? '⚓ PUERTO' : '⚙ TERMINAL'}</span>
                       <span className="badge-val">{header.airport || header.airportOther}</span>
                    </div>
                    <button type="button" className="btn-back-selector" onClick={() => { 
                      updateSection('header', 'airportCategory', ''); 
                      updateSection('header', 'airport', ''); 
                      updateSection('header', 'airportOther', '');
                    }}>✕</button>
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
