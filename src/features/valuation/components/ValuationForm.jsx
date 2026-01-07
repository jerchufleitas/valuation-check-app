import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { toPlainObject } from '../../../utils/serialization';
import { saveValuation } from '../../../firebase/valuationService';
import { valuationQuestions, getQuestionsByCategory } from '../data/valuationLogic';
import { currencyData, getCurrencySymbol, getCurrencyName } from '../data/currencyData';
import { incoterms } from '../data/incotermsLogic';
import { ChevronDown, ChevronUp } from 'lucide-react';
import OcrDropzone from './OcrDropzone';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Search, User, Building2, CreditCard, ChevronRight } from 'lucide-react';
import { getClients } from '../../../firebase/clientService';
import { getCurrencyLabel } from '../../../utils/formatters';

// The Parser: Regla de Oro - Comercio Exterior Argentina
const parseArgentineNumber = (value) => {
  if (typeof value !== 'string') return value;
  // Eliminar puntos de miles y cambiar coma por punto decimal de JS
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

const ValuationForm = ({ onCalculate, user, initialData }) => {
  const [formData, setFormData] = useLocalStorage('valuation_data_v4', {
    id: crypto.randomUUID(),
    status: 'BORRADOR', // 'BORRADOR' | 'FINALIZADO'
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      cliente: '',
      referencia: '',
      fecha: new Date().toLocaleDateString()
    },
    valoracion: {
      incoterm: 'FOB',
      precioBase: 0,
      ajustes: {},
      totales: { fob: 0, cif: 0 }
    },
    ncm: { codigo: '', descripcion: '' },
    header: {
      userType: '', // '' (default) | 'IMPORTADOR' | 'EXPORTADOR'
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
      customsCategory: '', // 'INTERIOR' | 'FRONTERA' | 'PUERTOS' | 'ZF'
      borderCrossing: '',
    },
    transaction: {
      currency: 'DOL',
      incoterm: 'FOB',
      loadingPlace: '',
      paymentMethod: '',
      internationalFreight: '',
    },
    item: {
      ncmCode: '',
      quantity: '',
      unit: '',
      unitValue: '',
      totalValue: '',
      description: '',
    },
    valuation: {
      // Estructura para las 17 preguntas de RG 2010/2006
    },
    documentation: {
      originCertificateAttached: null,
      originCertificate: '',
      invoiceAttached: null,
      invoiceType: null,
      invoiceFile: null,
      insuranceContractAttached: null,
      insuranceContractFile: null,
      freightContractAttached: null,
      freightContractFile: null,
      purchaseContract: null,
      purchaseContractFile: null,
    }
  });

  // Effect to load initialData (drafts from history or client pre-fill)
  useEffect(() => {
    if (initialData) {
      // Restore valuation object from adjustments array if it exists (for drafts/history)
      const restoredValuation = {};
      if (initialData.valoracion?.ajustes && Array.isArray(initialData.valoracion.ajustes)) {
        initialData.valoracion.ajustes.forEach(item => {
          restoredValuation[item.id] = {
            status: item.value,
            amount: item.amount ? item.amount.toString() : ''
          };
        });
      }

      setFormData(prev => ({
        ...prev, // Default structure
        ...initialData,
        // Deep merge critical sections to avoid losing fields
        metadata: { ...prev.metadata, ...initialData.metadata },
        header: { ...prev.header, ...initialData.header },
        transaction: { ...prev.transaction, ...initialData.transaction },
        valuation: Object.keys(restoredValuation).length > 0 ? restoredValuation : (initialData.valuation || prev.valuation || {}),
        id: initialData.id || prev.id || crypto.randomUUID() 
      }));
    }
  }, [initialData]);

  const [clients, setClients] = useState([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      getClients(user.uid).then(setClients);
    }
  }, [user?.uid]);

  const handleSelectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        cliente: client.razonSocial,
        clientId: client.id
      },
      header: {
        ...prev.header,
        exporterName: client.razonSocial,
        exporterTaxId: client.cuit
      },
      transaction: {
        ...prev.transaction,
        currency: client.configDefault?.currency || prev.transaction.currency,
        incoterm: client.configDefault?.incoterm || prev.transaction.incoterm
      }
    }));
    setShowClientSuggestions(false);
  };

  const [simError, setSimError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
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
      { id: '038', name: 'MENDOZA (038)' },
      { id: '053', name: 'ROSARIO (053)' },
      { id: '060', name: 'SALTA (060)' },
      { id: '062', name: 'SANTA FE (062)' },
      { id: '067', name: 'USHUAIA (067)' },
      { id: '074', name: 'TUCUMAN (074)' },
      { id: '089', name: 'SANTIAGO DEL ESTERO (089)' },
      { id: '094', name: 'VENADO TUERTO (094)' },
      { id: '101', name: 'EZEIZA (101)' }
    ],
    FRONTERA: [
      { id: '012', name: 'CLORINDA (012)' },
      { id: '013', name: 'COLON (013)' },
      { id: '016', name: 'CONCORDIA (016)' },
      { id: '022', name: 'GUALEGUAYCHU (022)' },
      { id: '024', name: 'FORMOSA (024)' },
      { id: '031', name: 'IGUAZU (031)' },
      { id: '033', name: 'LA QUIACA (033)' },
      { id: '041', name: 'PASO DE LOS LIBRES (041)' },
      { id: '045', name: 'NEUQUEN (045)' },
      { id: '046', name: 'ORAN (046)' },
      { id: '048', name: 'POSADAS (048)' },
      { id: '066', name: 'TINOGASTA (066)' },
      { id: '084', name: 'SANTO TOME (084)' }
    ],
    PUERTOS: [
      { id: '003', name: 'BAHIA BLANCA (003)' },
      { id: '008', name: 'CAMPANA (008)' },
      { id: '037', name: 'MAR DEL PLATA (037)' },
      { id: '049', name: 'PUERTO MADRYN (049)' },
      { id: '054', name: 'SAN LORENZO (054)' },
      { id: '056', name: 'SAN NICOLAS (056)' },
      { id: '069', name: 'VILLA CONSTITUCION (069)' },
      { id: '085', name: 'VILLA REGINA (085)' },
      { id: '091', name: 'ZARATE (091)' }
    ],
    ZF: [
      { id: '253', name: 'Z.F. RIO GALLEGOS (253)' },
      { id: '258', name: 'Z.F. GENERAL PICO (258)' },
      { id: '266', name: 'Z.F. CORONEL ROSALES (266)' },
      { id: '267', name: 'ZF CONCEP. DEL URUG. (267)' },
      { id: '268', name: 'Z.F.V.CONSTITUCION (268)' },
      { id: '269', name: 'Z.F. PUERTO GALVAN (269)' },
      { id: '274', name: 'Z.F. PERICO (274)' },
      { id: '275', name: 'Z.F. ZAPALA (275)' }
    ]
  };

  const paymentMethodsData = [
    { code: '01', name: 'PAGO ANTICIPADO' },
    { code: '02', name: 'PAGO CONTRA ENTREGA' },
    { code: '03', name: 'PAGO DIFERIDO' },
    { code: '04', name: 'CARTA DE CREDITO' },
    { code: '05', name: 'COBRANZA DOCUMENTARIA' },
    { code: '06', name: 'CUENTA CORRIENTE' },
    { code: '07', name: 'ORDEN DE PAGO' },
    { code: '08', name: 'TRANSFERENCIA' },
    { code: '09', name: 'OTROS' }
  ];

  const unitsData = [
    { code: '01', name: 'KILOGRAMO' },
    { code: '02', name: 'METRO' },
    { code: '03', name: 'METRO CUADRADO' },
    { code: '04', name: 'METRO CUBICO' },
    { code: '05', name: 'LITRO' },
    { code: '06', name: 'MEGAWATT HORA' },
    { code: '07', name: 'UNIDAD' },
    { code: '08', name: 'PAR' },
    { code: '09', name: 'DOCENA' },
    { code: '10', name: 'QUILATE' },
    { code: '11', name: 'MILLAR' },
    { code: '14', name: 'GRAMO' },
    { code: '15', name: 'MILIMETRO' },
    { code: '16', name: 'MM CUBICO' },
    { code: '17', name: 'KILOMETRO' },
    { code: '18', name: 'HECTOLITRO' },
    { code: '20', name: 'CENTIMETRO' },
    { code: '25', name: 'JGO.PQT.MAZO NAIPES' },
    { code: '27', name: 'CM CUBICO' },
    { code: '29', name: 'TONELADA' },
    { code: '30', name: 'DAM CUBICO' },
    { code: '31', name: 'HM CUBICO' },
    { code: '32', name: 'KM CUBICO' },
    { code: '33', name: 'MICROGRAMO' },
    { code: '34', name: 'NANOGRAMO' },
    { code: '35', name: 'PICOGRAMO' },
    { code: '41', name: 'MILIGRAMO' },
    { code: '47', name: 'MILILITRO' },
    { code: '48', name: 'CURIE' },
    { code: '49', name: 'MILICURIE' },
    { code: '50', name: 'MICROCURIE' },
    { code: '51', name: 'U.I.ACT.HOR' },
    { code: '52', name: 'MUIACTHOR' },
    { code: '53', name: 'KGBASE' },
    { code: '54', name: 'GRUESA' },
    { code: '61', name: 'KG.BRUTO' },
    { code: '62', name: 'U.I.ACT.ANT' },
    { code: '63', name: 'MUIACTANT' },
    { code: '64', name: 'U.I.ACT.IG' },
    { code: '65', name: 'MUIACTIG' },
    { code: '66', name: 'KG ACTIVO' },
    { code: '67', name: 'GRACTIVO' },
    { code: '68', name: 'GRAMO BASE' },
    { code: '69', name: 'U.INTER.ACT.ATCOAG' },
    { code: '70', name: 'MEGAU.INT.ACT.ATCO...' },
    { code: '71', name: 'JOULE' },
    { code: '72', name: 'MILLON DE JOULES' }
  ];

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

  const { header, transaction, item, valuation, documentation } = formData;

  // Auto-calculate Total Item when quantity or unitValue changes
  useEffect(() => {
    const qty = parseArgentineNumber(item.quantity) || 0;
    const unitVal = parseArgentineNumber(item.unitValue) || 0;
    const calculatedTotal = qty * unitVal;
    
    // Solo actualizamos si el total calculado difiere significativamente del actual
    const currentTotal = parseArgentineNumber(item.totalValue || '0');
    if (calculatedTotal > 0 && Math.abs(calculatedTotal - currentTotal) > 0.01) {
      setFormData(prev => ({
        ...prev,
        item: { 
          ...prev.item, 
          totalValue: calculatedTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        valoracion: { ...prev.valoracion, precioBase: calculatedTotal }
      }));
    }
  }, [item.quantity, item.unitValue]);

  const updateSection = (section, field, value, isFromOcr = false) => {
    setFormData(prev => {
      const next = {
        ...prev,
        [section]: { ...prev[section], [field]: value }
      };

      // Sync master structure
      if (section === 'header') {
        if (field === 'importerName') next.metadata.cliente = value;
        if (field === 'transportDocument') next.metadata.referencia = value;
      }
      if (section === 'transaction' && field === 'incoterm') next.valoracion.incoterm = value;
      if (section === 'item') {
        if (field === 'ncmCode') next.ncm.codigo = value;
        if (field === 'description') next.ncm.descripcion = value;
        if (field === 'totalValue' || field === 'quantity' || field === 'unitValue') {
          const baseValue = parseArgentineNumber(next.item.totalValue);
          next.valoracion.precioBase = baseValue;
        }
      }

      // Generar índice de búsqueda optimizado para Firebase
      next.metadata.searchIndex = `${next.metadata.cliente || ''} ${next.metadata.referencia || ''}`.toLowerCase().trim();
      
      return next;
    });
    
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

  const handleValuationSelection = (questionId, selection) => {
    setFormData(prev => {
      const currentStatus = prev.valuation[questionId]?.status;
      const currentAmount = prev.valuation[questionId]?.amount || '';
      
      // Si ya está seleccionado, deseleccionar (toggle)
      if (currentStatus === selection) {
        return {
          ...prev,
          valuation: {
            ...prev.valuation,
            [questionId]: {
              status: null,
              amount: ''
            }
          }
        };
      }
      
      // Si está cambiando a SI, preservar el amount existente
      // Si está cambiando a NO, limpiar el amount
      return {
        ...prev,
        valuation: {
          ...prev.valuation,
          [questionId]: {
            status: selection,
            amount: selection === 'SI' ? currentAmount : ''
          }
        }
      };
    });
  };

  const handleValuationAmount = (questionId, value) => {
    // Store as string to avoid any parsing/formatting issues
    setFormData(prev => ({
      ...prev,
      valuation: {
        ...prev.valuation,
        [questionId]: {
          ...prev.valuation[questionId],
          amount: value
        }
      }
    }));
  };

  const loadExample = () => {
    const exampleHeader = {
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
    };
    const exampleTransaction = {
      currency: 'DOL',
      incoterm: 'FOB',
      loadingPlace: 'Mendoza, Argentina',
      paymentMethod: '04',
      internationalFreight: '1200,00',
    };
    const exampleItem = {
      ncmCode: '2204.21.00.100G',
      quantity: '1200',
      unit: 'Botellas',
      unitValue: '8.50',
      totalValue: '10200',
      description: 'Vino Tinto Malbec Premium - Cosecha 2023. Estuches de madera.',
    };

    setFormData(prev => ({
      ...prev,
      metadata: {
        cliente: exampleHeader.importerName,
        referencia: exampleHeader.transportDocument,
        fecha: new Date().toLocaleDateString()
      },
      valoracion: {
        ...prev.valoracion,
        incoterm: exampleTransaction.incoterm,
        precioBase: 10200
      },
      ncm: {
        codigo: exampleItem.ncmCode,
        descripcion: exampleItem.description
      },
      header: exampleHeader,
      transaction: exampleTransaction,
      item: exampleItem,
      valuation: {},
      documentation: {
        originCertificateAttached: 'SI',
        originCertificate: 'COD-2025-9988',
        invoiceNumber: 'FC-A-0001-000045',
        insuranceContract: 'POL-99122',
        freightContract: 'CTR-TX-55',
      }
    }));
  };

  const clearForm = () => {
    const newId = crypto.randomUUID();
    setFormData({
      id: newId,
      status: 'BORRADOR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { cliente: '', referencia: '', fecha: new Date().toLocaleDateString(), searchIndex: '' },
      valoracion: { incoterm: 'FOB', precioBase: 0, ajustes: {}, totales: { fob: 0, cif: 0 } },
      ncm: { codigo: '', descripcion: '' },
      header: { userType: '', exporterName: '', exporterTaxId: '', importerName: '', importerDetails: '', transportDocument: '', transportMode: 'Terrestre', presence: null, airportCategory: '', airport: '', airportOther: '', customsCategory: '', borderCrossing: '' },
      transaction: { currency: 'DOL', incoterm: 'FOB', loadingPlace: '', paymentMethod: '', internationalFreight: '' },
      item: { ncmCode: '', quantity: '', unit: '', unitValue: '', totalValue: '', description: '' },
      valuation: {},
      documentation: { originCertificateAttached: null, originCertificate: '', invoiceAttached: null, invoiceType: null, invoiceFile: null, insuranceContractAttached: null, insuranceContractFile: null, freightContractAttached: null, freightContractFile: null, purchaseContract: null, purchaseContractFile: null }
    });
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
    const base = parseArgentineNumber(item.totalValue || '0');
    
    // Sumar adiciones (preguntas de categoría 'additions' con status 'SI')
    const additions = valuationQuestions
      .filter(q => q.category === 'additions' && valuation[q.id]?.status === 'SI')
      .reduce((sum, q) => sum + parseArgentineNumber(valuation[q.id]?.amount || '0'), 0);
    
    // Restar deducciones (preguntas de categoría 'deductions' con status 'SI')
    const deductions = valuationQuestions
      .filter(q => q.category === 'deductions' && valuation[q.id]?.status === 'SI')
      .reduce((sum, q) => sum + parseArgentineNumber(valuation[q.id]?.amount || '0'), 0);
    
    let total = base + additions - deductions;
    
    if (documentation.originCertificateAttached === 'NO') {
      const fine = total * 0.01;
      total += fine;
    }
    return total;
  };

  const getFineAmount = () => {
    if (documentation.originCertificateAttached === 'NO') {
      const baseTotal = parseArgentineNumber(item.totalValue || '0');
      
      const additions = valuationQuestions
        .filter(q => q.category === 'additions' && valuation[q.id]?.status === 'SI')
        .reduce((sum, q) => sum + parseArgentineNumber(valuation[q.id]?.amount || '0'), 0);
      
      const deductions = valuationQuestions
        .filter(q => q.category === 'deductions' && valuation[q.id]?.status === 'SI')
        .reduce((sum, q) => sum + parseArgentineNumber(valuation[q.id]?.amount || '0'), 0);
      
      return (baseTotal + additions - deductions) * 0.01;
    }
    return 0;
  };

  const saveAsDraft = async () => {
    setIsSaving(true);
    const draftFormData = { ...formData, status: 'BORRADOR', updatedAt: new Date().toISOString() };
    
    // Minimal normalization for draft saving
    const valuationArray = valuationQuestions.map(q => ({
      id: q.id,
      number: q.number,
      label: q.text,
      value: valuation[q.id]?.status || null,
      amount: parseArgentineNumber(valuation[q.id]?.amount || '0')
    }));

    const sessionToSave = toPlainObject({
      session: {
        ...draftFormData,
        valoracion: {
          ...draftFormData.valoracion,
          ajustes: valuationArray,
          totales: { fob: getCalculatedValue(), cif: 0 }
        }
      },
      finalValue: getCalculatedValue(),
      blocks: draftFormData,
      summary: {
        exporter: header.exporterName,
        importer: header.importerName,
        ncm: item.ncmCode,
        incoterm: transaction.incoterm,
        currency: transaction.currency
      }
    });

    try {
      await saveValuation(sessionToSave, user?.uid);
      alert("Borrador guardado exitosamente.");
    } catch (error) {
      alert("Error al guardar borrador.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mandatory Validations for Finalization
    if (!item.totalValue) return alert("Error: Debe ingresar el valor total del ítem.");
    if (simError) return alert("Error: Formato de Posición SIM incorrecto.");
    if (header.presence === null) return alert("Obligatorio: Debe aclarar la PRESENCIA (SI/NO) en Bloque A.");
    if (documentation.originCertificateAttached === null) return alert("Obligatorio: Debe aclarar el CERTIFICADO DE ORIGEN (SI/NO) en Bloque DOCS.");
    
    // Validate all 17 Valuation Questions
    const missingQuestions = valuationQuestions.some(q => !valuation[q.id] || valuation[q.id].status === null);
    
    if (missingQuestions) {
      return alert("Obligatorio: Todas las 17 preguntas del Bloque D (Declaración de Valor) deben ser respondidas expresamente con SI o NO para finalizar.");
    }

    setIsSaving(true);
    const finalizedFormData = { ...formData, status: 'FINALIZADO', updatedAt: new Date().toISOString() };

    // Transform valuation (Block D) into an array of plain objects for the master session
    const valuationArray = valuationQuestions.map(q => ({
      id: q.id,
      number: q.number,
      label: q.text,
      value: valuation[q.id]?.status || 'NO',
      amount: parseArgentineNumber(valuation[q.id]?.amount || '0')
    }));

    const finalSession = toPlainObject({ 
      session: {
        ...finalizedFormData,
        valoracion: {
          ...finalizedFormData.valoracion,
          ajustes: valuationArray,
          totales: {
            fob: getCalculatedValue(),
            cif: 0 
          }
        }
      },
      finalValue: getCalculatedValue(),
      blocks: finalizedFormData,
      summary: {
        exporter: header.exporterName,
        importer: header.importerName,
        ncm: item.ncmCode,
        incoterm: transaction.incoterm,
        currency: transaction.currency
      }
    });

    // Guardar en Firebase y luego mostrar reporte
    (async () => {
      try {
        await saveValuation(finalSession, user?.uid);
        setTimeout(() => {
          onCalculate(finalSession);
          setIsSaving(false);
        }, 800);
      } catch (error) {
        setIsSaving(false);
        alert("Error al guardar en la nube (Firebase). La valoración se guardó localmente, pero revisá tu conexión.");
        onCalculate(finalSession);
      }
    })();
  };

  // AI OCR DATA MAPPING
  const handleOcrData = (extractedData) => {
    // 1. Fill Form Sections
    if (extractedData.header) {
      Object.entries(extractedData.header).forEach(([field, value]) => updateSection('header', field, value, true));
    }
    if (extractedData.transaction) {
      Object.entries(extractedData.transaction).forEach(([field, value]) => updateSection('transaction', field, value, true));
      // Map detected freight directly if available in metadata
      if (extractedData.ai_metadata?.detected_freight) {
        updateSection('transaction', 'internationalFreight', extractedData.ai_metadata.detected_freight, true);
      }
    }
    if (extractedData.item) {
      Object.entries(extractedData.item).forEach(([field, value]) => updateSection('item', field, value, true));
      if (extractedData.item.ncmCode) validateSimFormat(extractedData.item.ncmCode);
    }
    if (extractedData.documentation) {
       Object.entries(extractedData.documentation).forEach(([field, value]) => updateSection('documentation', field, value, true));
    }
    
    // 2. Handle AI Warnings/Flags
    if (extractedData.ai_metadata?.flags?.length > 0) {
       // Simple alert for MVP. In future, use a custom Toast.
       console.warn("AI Flags:", extractedData.ai_metadata.flags);
    }

    // 3. Smart Suggestions (Freight/Insurance detection)
    // 3. Smart Suggestions (Freight/Insurance detection)
    if (extractedData.ai_metadata?.detected_freight) {
        // Normalizamos el valor a string formato AR
        let freightValue = extractedData.ai_metadata.detected_freight;
        
        // Pequeño delay para no saturar al usuario inmediatamente
        setTimeout(() => {
          if (window.confirm(`Gemini detectó un Flete por ${freightValue}. ¿Desea agregarlo a los ajustes del Art. 8 (Gastos de Transporte)?`)) {
              // Mapeamos a la pregunta 'freight_cost' que definimos en valuationLogic.js
              updateSection('valuation', 'freight_cost', { 
                  status: 'SI', 
                  amount: freightValue 
              }, true);
          }
        }, 500);
    }

    if (extractedData.ai_metadata?.detected_insurance) {
       let insuranceValue = extractedData.ai_metadata.detected_insurance;
        setTimeout(() => {
          if (window.confirm(`Gemini detectó Seguro por ${insuranceValue}. ¿Desea agregarlo como ajuste?`)) {
              updateSection('valuation', 'insurance_cost', { 
                  status: 'SI', 
                  amount: insuranceValue 
              }, true);
          }
        }, 1200); // Un poco después del flete
    }
  };

  const isHighlighted = (section, field) => highlightedFields[`${section}.${field}`] ? 'highlighted-fill' : '';

  return (
    <div className="valuation-form fade-in">
      
      {/* OCR Dropzone hidden for Manual Mode */}
      <OcrDropzone onDataExtracted={handleOcrData} />

      <form onSubmit={handleSubmit}>
        
        {/* METADATA & CLIENT SELECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#c4a159] mb-2 block">Vincular Cliente</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar o escribir nombre del cliente..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#c4a159] outline-none transition-all font-bold text-slate-800"
                value={formData.metadata?.cliente || ''}
                onChange={(e) => {
                  updateSection('metadata', 'cliente', e.target.value);
                  setShowClientSuggestions(true);
                }}
                onFocus={() => setShowClientSuggestions(true)}
              />
              
              <AnimatePresence>
                {showClientSuggestions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-[100] left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto"
                  >
                    <div className="p-2 border-b border-slate-50 bg-slate-50 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Sugerencias del Directorio</span>
                       <button type="button" onClick={() => setShowClientSuggestions(false)} className="text-[10px] font-bold text-[#c4a159] hover:underline px-2">Cerrar</button>
                    </div>
                    {clients
                      .filter(c => c.razonSocial.toLowerCase().includes((formData.metadata?.cliente || '').toLowerCase()))
                      .map(client => (
                        <button
                          key={client.id}
                          type="button"
                          className="w-full text-left p-4 hover:bg-slate-50 transition-all flex items-center justify-between group"
                          onClick={() => handleSelectClient(client)}
                        >
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-[#c4a159]">{client.razonSocial}</p>
                            <p className="text-[10px] text-slate-400 font-mono">CUIT: {client.cuit}</p>
                          </div>
                          <ChevronRight size={16} className="text-slate-200 group-hover:text-[#c4a159]" />
                        </button>
                    ))}
                    {clients.filter(c => c.razonSocial.toLowerCase().includes((formData.metadata?.cliente || '').toLowerCase())).length === 0 && (
                      <div className="p-4 text-center text-xs font-bold text-slate-400 italic">No se encontraron clientes registrados</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Referencia Interna / Expediente</label>
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Ej: EXP-2025-001"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#c4a159] outline-none transition-all font-bold text-slate-800"
                  value={formData.metadata?.referencia || ''}
                  onChange={(e) => updateSection('metadata', 'referencia', e.target.value)}
                />
             </div>
          </div>
        </div>
        
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
                <button type="button" className={`btn-si-no ${header.userType === 'EXPORTADOR' ? 'si-active' : ''}`} onClick={() => updateSection('header', 'userType', header.userType === 'EXPORTADOR' ? '' : 'EXPORTADOR')}>EXPORTADOR</button>
                <button type="button" className={`btn-si-no ${header.userType === 'IMPORTADOR' ? 'no-active' : ''}`} onClick={() => updateSection('header', 'userType', header.userType === 'IMPORTADOR' ? '' : 'IMPORTADOR')}>IMPORTADOR</button>
              </div>
              <button type="button" onClick={loadExample} className="btn-ghost" style={{marginLeft: '10px'}}>Ejemplo</button>
              <button type="button" onClick={clearForm} className="btn-ghost" style={{marginLeft: '5px'}}>Limpiar</button>
            </div>
          </div>

          <div className="official-grid">
            <div className={`official-cell span-8 ${isHighlighted('header', 'exporterName')}`}>
              <label>1. {header.userType || 'USUARIO'} (RAZÓN SOCIAL)</label>
              <input type="text" value={header.exporterName} onChange={(e) => updateSection('header', 'exporterName', e.target.value)} placeholder="Nombre Legal" />
            </div>
            <div className={`official-cell span-4 ${isHighlighted('header', 'exporterTaxId')}`}>
              <label>ID FISCAL</label>
              <input type="text" value={header.exporterTaxId} onChange={(e) => updateSection('header', 'exporterTaxId', e.target.value)} placeholder="CUIT / NIF" />
            </div>
            
            <div className={`official-cell span-8 ${isHighlighted('header', 'importerName')}`}>
              <label>2. {header.userType === 'EXPORTADOR' ? 'CLIENTE EXTRANJERO' : header.userType === 'IMPORTADOR' ? 'PROVEEDOR EXTRANJERO' : 'CONTRAPARTE'}</label>
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
                 <button type="button" className={`btn-si-no ${header.presence === 'SI' ? 'si-active' : ''}`} onClick={() => updateSection('header', 'presence', header.presence === 'SI' ? null : 'SI')}>SI</button>
                 <button type="button" className={`btn-si-no ${header.presence === 'NO' ? 'no-active' : ''}`} onClick={() => updateSection('header', 'presence', header.presence === 'NO' ? null : 'NO')}>NO</button>
              </div>
            </div>

            <div className={`official-cell span-6 ${isHighlighted('header', 'borderCrossing')}`}>
              <label>4. PASO FRONTERIZO / ADUANA</label>
              <div className="terminal-selector-container">
                {(!header.customsCategory || header.customsCategory === '') && !header.borderCrossing ? (
                  <div className="category-reveal-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
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
                      <span className="label">PORTUARIAS</span>
                    </button>
                    <button type="button" className="btn-category" onClick={() => updateSection('header', 'customsCategory', 'ZF')}>
                      <span className="icon">🏗️</span>
                      <span className="label">Z. FRANCAS</span>
                    </button>
                  </div>
                ) : header.customsCategory && header.customsCategory !== '' && !header.borderCrossing ? (
                  <div className="terminal-reveal-panel slide-down">
                    <div className="reveal-header">
                       <span className="reveal-title">
                         {header.customsCategory === 'INTERIOR' ? 'ADUANAS DE INTERIOR' : 
                          header.customsCategory === 'FRONTERA' ? 'ADUANAS DE FRONTERA' : 
                          header.customsCategory === 'PUERTOS' ? 'ADUANAS PORTUARIAS' : 'ZONAS FRANCAS'}
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
                      {customsData[header.customsCategory] && customsData[header.customsCategory]
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
                {(!header.airportCategory || header.airportCategory === '') && !header.airport && !header.airportOther ? (
                  <div className="category-reveal-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
                ) : (header.airportCategory === 'AERO' || header.airportCategory === 'PUERTO') && !header.airport ? (
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
                      {terminalData[header.airportCategory] && terminalData[header.airportCategory]
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
                {currencyData.map(c => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
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
            <div className={`official-cell span-4 ${isHighlighted('transaction', 'paymentMethod')}`}>
              <label>9. MÉTODO DE PAGO</label>
              <select value={transaction.paymentMethod} onChange={(e) => updateSection('transaction', 'paymentMethod', e.target.value)}>
                <option value="">Seleccionar...</option>
                {paymentMethodsData.map(pm => (
                  <option key={pm.code} value={pm.code}>{pm.code} - {pm.name}</option>
                ))}
              </select>
            </div>
            <div className={`official-cell span-4 ${isHighlighted('transaction', 'internationalFreight')}`}>
              <label>10. FLETE INTERNACIONAL</label>
              <div className="currency-input-wrapper">
                <span className="ccy-tag">{getCurrencySymbol(transaction.currency)}</span>
                <input 
                  type="text" 
                  value={transaction.internationalFreight || ''} 
                  onChange={(e) => updateSection('transaction', 'internationalFreight', e.target.value)} 
                  placeholder="Monto detectar..." 
                />
              </div>
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
            <div className="header-info-badge" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
              <HelpCircle size={14} />
              <span>Usar coma (,) para centavos. El punto de miles es opcional.</span>
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
              <input type="text" value={item.quantity} onChange={(e) => updateSection('item', 'quantity', e.target.value)} placeholder="0" />
            </div>
            <div className={`official-cell span-2 ${isHighlighted('item', 'unit')}`}>
              <label>UNIDAD</label>
              <select value={item.unit} onChange={(e) => updateSection('item', 'unit', e.target.value)}>
                <option value="">Seleccionar...</option>
                {unitsData.map(u => (
                  <option key={u.code} value={u.name}>{u.code} - {u.name}</option>
                ))}
              </select>
            </div>
            <div className={`official-cell span-2 ${isHighlighted('item', 'unitValue')}`}>
              <label>VALOR UNIT.</label>
              <div className="currency-input-wrapper">
                <span className="ccy-tag">{getCurrencySymbol(transaction.currency)}</span>
                <input type="text" value={item.unitValue} onChange={(e) => updateSection('item', 'unitValue', e.target.value)} placeholder="0,00" />
              </div>
            </div>
            <div className={`official-cell span-2 highlight ${isHighlighted('item', 'totalValue')}`}>
              <label>TOTAL ÍTEM</label>
              <div className="currency-input-wrapper">
                <span className="ccy-tag">{getCurrencySymbol(transaction.currency)}</span>
                <input type="text" value={item.totalValue} onChange={(e) => updateSection('item', 'totalValue', e.target.value)} className="bold-input" placeholder="0,00" />
              </div>
            </div>
            <div className={`official-cell span-12 ${isHighlighted('item', 'description')}`}>
              <label>11. DESCRIPCIÓN COMERCIAL</label>
              <textarea rows="3" value={item.description} onChange={(e) => updateSection('item', 'description', e.target.value)} placeholder="Indicar marcas, modelos, y especificaciones técnicas..." />
            </div>
          </div>
        </section>

        <div className="block-separator"></div>

        {/* BLOQUE D: DECLARACIÓN DE VALOR (RG 2010/2006) */}
        <section className={`form-block official-paper ${collapsed.adjustments ? 'is-collapsed' : ''}`}>
          <div className="block-header clickable" onClick={() => toggleCollapse('adjustments')}>
            <span className="block-tag">BLOQUE D</span>
            <h3>DECLARACIÓN DE VALOR (RG 2010/2006)</h3>
            <div className="collapse-icon">
              {collapsed.adjustments ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
          </div>

          {/* SUB-BLOQUE 1: CONDICIONES GENERALES Y VINCULACIÓN */}
          <div className="valuation-subblock">
            <div className="subblock-header">
              <span className="subblock-title">I. CONDICIONES GENERALES Y VINCULACIÓN</span>
              <span className="subblock-subtitle">Preguntas 1-7</span>
            </div>
            <div className="valuation-questions-list">
              {getQuestionsByCategory('general').map(q => {
                const status = valuation[q.id]?.status || null;
                return (
                  <div key={q.id} className={`valuation-question-item ${status === 'SI' ? 'active' : ''}`}>
                    <div className="question-row">
                      <span className="question-number">{q.number}.</span>
                      <span className="question-text">{q.text}</span>
                      <div className="si-no-selector small">
                        <button 
                          type="button" 
                          className={`btn-si-no ${status === 'SI' ? 'si-active' : ''}`} 
                          onClick={() => handleValuationSelection(q.id, 'SI')}
                        >
                          SI
                        </button>
                        <button 
                          type="button" 
                          className={`btn-si-no ${status === 'NO' ? 'no-active' : ''}`} 
                          onClick={() => handleValuationSelection(q.id, 'NO')}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUB-BLOQUE 2: ADICIONES AL PRECIO */}
          <div className="valuation-subblock">
            <div className="subblock-header additions">
              <div className="subblock-header-content">
                <span className="subblock-title">II. ADICIONES AL PRECIO</span>
                <span className="subblock-subtitle">Elementos a incluir si no están en el precio (Preguntas 8-14)</span>
              </div>
              <div className="subblock-subtotal">
                <span className="subtotal-label">Subtotal:</span>
                <span className="subtotal-value">
                  {getCurrencySymbol(transaction.currency)} {valuationQuestions
                    .filter(q => q.category === 'additions' && valuation[q.id]?.status === 'SI')
                    .reduce((sum, q) => sum + parseArgentineNumber(valuation[q.id]?.amount || '0'), 0)
                    .toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="valuation-questions-list">
              {getQuestionsByCategory('additions').map(q => {
                const status = valuation[q.id]?.status || null;
                return (
                  <div key={q.id} className={`valuation-question-item ${status === 'SI' ? 'active' : ''}`}>
                    <div className="question-row">
                      <span className="question-number">{q.number}.</span>
                      <span className="question-text">{q.text}</span>
                      <div className="si-no-selector small">
                        <button 
                          type="button" 
                          className={`btn-si-no ${status === 'SI' ? 'si-active' : ''}`} 
                          onClick={() => handleValuationSelection(q.id, 'SI')}
                        >
                          SI
                        </button>
                        <button 
                          type="button" 
                          className={`btn-si-no ${status === 'NO' ? 'no-active' : ''}`} 
                          onClick={() => handleValuationSelection(q.id, 'NO')}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                    {status === 'SI' && q.requiresAmount && (
                      <div className="question-amount-row slide-down">
                        <label>{q.inputLabel}:</label>
                        <div className="currency-input-wrapper">
                          <span className="ccy-tag">{getCurrencySymbol(transaction.currency)}</span>
                          <input 
                            type="text" 
                            value={valuation[q.id]?.amount || ''} 
                            onChange={(e) => handleValuationAmount(q.id, e.target.value)} 
                            placeholder="0,00" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SUB-BLOQUE 3: DEDUCCIONES AL PRECIO */}
          <div className="valuation-subblock">
            <div className="subblock-header deductions">
              <div className="subblock-header-content">
                <span className="subblock-title">III. DEDUCCIONES AL PRECIO</span>
                <span className="subblock-subtitle">Elementos a excluir si están incluidos (Preguntas 15-17)</span>
              </div>
              <div className="subblock-subtotal">
                <span className="subtotal-label">Subtotal:</span>
                <span className="subtotal-value">
                  {getCurrencySymbol(transaction.currency)} {valuationQuestions
                    .filter(q => q.category === 'deductions' && valuation[q.id]?.status === 'SI')
                    .reduce((sum, q) => sum + parseArgentineNumber(valuation[q.id]?.amount || '0'), 0)
                    .toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="valuation-questions-list">
              {getQuestionsByCategory('deductions').map(q => {
                const status = valuation[q.id]?.status || null;
                return (
                  <div key={q.id} className={`valuation-question-item ${status === 'SI' ? 'active' : ''}`}>
                    <div className="question-row">
                      <span className="question-number">{q.number}.</span>
                      <span className="question-text">{q.text}</span>
                      <div className="si-no-selector small">
                        <button 
                          type="button" 
                          className={`btn-si-no ${status === 'SI' ? 'si-active' : ''}`} 
                          onClick={() => handleValuationSelection(q.id, 'SI')}
                        >
                          SI
                        </button>
                        <button 
                          type="button" 
                          className={`btn-si-no ${status === 'NO' ? 'no-active' : ''}`} 
                          onClick={() => handleValuationSelection(q.id, 'NO')}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                    {status === 'SI' && q.requiresAmount && (
                      <div className="question-amount-row slide-down">
                        <label>{q.inputLabel}:</label>
                        <div className="currency-input-wrapper">
                          <span className="ccy-tag">{getCurrencySymbol(transaction.currency)}</span>
                          <input 
                            type="text" 
                            value={valuation[q.id]?.amount || ''} 
                            onChange={(e) => handleValuationAmount(q.id, e.target.value)} 
                            placeholder="0,00" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
                 <button type="button" className={`btn-si-no ${documentation.originCertificateAttached === 'SI' ? 'si-active' : ''}`} onClick={() => updateSection('documentation', 'originCertificateAttached', documentation.originCertificateAttached === 'SI' ? null : 'SI')}>SI</button>
                 <button type="button" className={`btn-si-no ${documentation.originCertificateAttached === 'NO' ? 'no-active' : ''}`} onClick={() => updateSection('documentation', 'originCertificateAttached', documentation.originCertificateAttached === 'NO' ? null : 'NO')}>NO</button>
              </div>
            </div>
            <div className={`official-cell span-8 ${isHighlighted('documentation', 'originCertificate')}`}>
              <label>DETALLE CERTIFICADO / ESTADO</label>
              {documentation.originCertificateAttached === 'SI' ? (
                <input type="text" value={documentation.originCertificate} onChange={(e) => updateSection('documentation', 'originCertificate', e.target.value)} placeholder="Número de Certificado" />
              ) : documentation.originCertificateAttached === 'NO' ? (
                <div className="fine-warning">
                  <span className="fine-label">A GARANTIZAR</span>
                  <span className="fine-value">Multa Estimada (1%): {getCurrencySymbol(transaction.currency)} {getFineAmount().toLocaleString()}</span>
                </div>
              ) : (
                <div className="pending-selection">
                  <span className="pending-text">Seleccione SI/NO para determinar requisitos</span>
                </div>
              )}
            </div>
            <div className={`official-cell span-12 ${isHighlighted('documentation', 'invoiceAttached')}`}>
              <label>¿Posee factura?</label>
              <div className="documentation-file-row">
                <div className="si-no-selector">
                  <button type="button" className={`btn-si-no ${documentation.invoiceAttached === 'SI' ? 'si-active' : ''}`} onClick={() => updateSection('documentation', 'invoiceAttached', documentation.invoiceAttached === 'SI' ? null : 'SI')}>SI</button>
                  <button type="button" className={`btn-si-no ${documentation.invoiceAttached === 'NO' ? 'no-active' : ''}`} onClick={() => updateSection('documentation', 'invoiceAttached', documentation.invoiceAttached === 'NO' ? null : 'NO')}>NO</button>
                </div>
                
                {documentation.invoiceAttached === 'SI' && (
                  <>
                    <div className="si-no-selector">
                      <button 
                        type="button" 
                        className={`btn-si-no ${documentation.invoiceType === 'PROFORMA' ? 'si-active' : ''}`} 
                        onClick={() => updateSection('documentation', 'invoiceType', documentation.invoiceType === 'PROFORMA' ? null : 'PROFORMA')}
                        style={{ minWidth: '100px' }}
                      >
                        PROFORMA
                      </button>
                      <button 
                        type="button" 
                        className={`btn-si-no ${documentation.invoiceType === 'LEGAL' ? 'si-active' : ''}`} 
                        onClick={() => updateSection('documentation', 'invoiceType', documentation.invoiceType === 'LEGAL' ? null : 'LEGAL')}
                        style={{ minWidth: '100px' }}
                      >
                        LEGAL
                      </button>
                    </div>

                    {documentation.invoiceType && (
                      <div className="file-upload-section">
                        <label className="file-upload-label">
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) updateSection('documentation', 'invoiceFile', file.name);
                            }}
                            style={{ display: 'none' }}
                          />
                          <span className="upload-btn">
                            📎 {documentation.invoiceFile || `Adjuntar ${documentation.invoiceType.toLowerCase()} (PDF/DOCX)`}
                          </span>
                        </label>
                        {documentation.invoiceFile && (
                          <button type="button" className="clear-file-btn" onClick={() => updateSection('documentation', 'invoiceFile', null)}>✕</button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className={`official-cell span-12 ${isHighlighted('documentation', 'insuranceContractAttached')}`}>
              <label>¿Posee contrato de seguro internacional?</label>
              <div className="documentation-file-row">
                <div className="si-no-selector">
                  <button type="button" className={`btn-si-no ${documentation.insuranceContractAttached === 'SI' ? 'si-active' : ''}`} onClick={() => updateSection('documentation', 'insuranceContractAttached', documentation.insuranceContractAttached === 'SI' ? null : 'SI')}>SI</button>
                  <button type="button" className={`btn-si-no ${documentation.insuranceContractAttached === 'NO' ? 'no-active' : ''}`} onClick={() => updateSection('documentation', 'insuranceContractAttached', documentation.insuranceContractAttached === 'NO' ? null : 'NO')}>NO</button>
                </div>
                {documentation.insuranceContractAttached === 'SI' && (
                  <div className="file-upload-section">
                    <label className="file-upload-label">
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) updateSection('documentation', 'insuranceContractFile', file.name);
                        }}
                        style={{ display: 'none' }}
                      />
                      <span className="upload-btn">
                        📎 {documentation.insuranceContractFile || 'Adjuntar contrato (PDF/DOCX)'}
                      </span>
                    </label>
                    {documentation.insuranceContractFile && (
                      <button type="button" className="clear-file-btn" onClick={() => updateSection('documentation', 'insuranceContractFile', null)}>✕</button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className={`official-cell span-12 ${isHighlighted('documentation', 'freightContractAttached')}`}>
              <label>¿Posee contrato de flete internacional?</label>
              <div className="documentation-file-row">
                <div className="si-no-selector">
                  <button type="button" className={`btn-si-no ${documentation.freightContractAttached === 'SI' ? 'si-active' : ''}`} onClick={() => updateSection('documentation', 'freightContractAttached', documentation.freightContractAttached === 'SI' ? null : 'SI')}>SI</button>
                  <button type="button" className={`btn-si-no ${documentation.freightContractAttached === 'NO' ? 'no-active' : ''}`} onClick={() => updateSection('documentation', 'freightContractAttached', documentation.freightContractAttached === 'NO' ? null : 'NO')}>NO</button>
                </div>
                {documentation.freightContractAttached === 'SI' && (
                  <div className="file-upload-section">
                    <label className="file-upload-label">
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            updateSection('documentation', 'freightContractFile', file.name);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      <span className="upload-btn">
                        📎 {documentation.freightContractFile || 'Adjuntar contrato (PDF/DOCX)'}
                      </span>
                    </label>
                    {documentation.freightContractFile && (
                      <button 
                        type="button" 
                        className="clear-file-btn"
                        onClick={() => updateSection('documentation', 'freightContractFile', null)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className={`official-cell span-12 ${isHighlighted('documentation', 'purchaseContract')}`}>
              <label>¿Existe contrato de compraventa internacional?</label>
              <div className="documentation-file-row">
                <div className="si-no-selector">
                  <button type="button" className={`btn-si-no ${documentation.purchaseContract === 'SI' ? 'si-active' : ''}`} onClick={() => updateSection('documentation', 'purchaseContract', documentation.purchaseContract === 'SI' ? null : 'SI')}>SI</button>
                  <button type="button" className={`btn-si-no ${documentation.purchaseContract === 'NO' ? 'no-active' : ''}`} onClick={() => updateSection('documentation', 'purchaseContract', documentation.purchaseContract === 'NO' ? null : 'NO')}>NO</button>
                </div>
                {documentation.purchaseContract === 'SI' && (
                  <div className="file-upload-section">
                    <label className="file-upload-label">
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            updateSection('documentation', 'purchaseContractFile', file.name);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      <span className="upload-btn">
                        📎 {documentation.purchaseContractFile || 'Adjuntar contrato (PDF/DOCX)'}
                      </span>
                    </label>
                    {documentation.purchaseContractFile && (
                      <button 
                        type="button" 
                        className="clear-file-btn"
                        onClick={() => updateSection('documentation', 'purchaseContractFile', null)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="valuation-footer">
          <div className="valuation-summary">
            <div className="summary-row summary-main">
              <span className="summary-label">INCOTERM: {transaction.incoterm || '—'} — {transaction.loadingPlace || 'SIN LUGAR'}</span>
              <div className="list-monto-group items-end">
                <span className="list-currency-tag">{getCurrencyLabel(transaction.currency)}</span>
                <span className="summary-value summary-highlight">
                  = {getCurrencySymbol(transaction.currency)} {parseArgentineNumber(item.totalValue || '0').toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span className="summary-label">TOTAL DE AJUSTES A INCLUIR:</span>
              <div className="list-monto-group items-end">
                <span className="list-currency-tag text-[9px]">{getCurrencyLabel(transaction.currency)}</span>
                <span className="summary-value additions-value">
                  + {getCurrencySymbol(transaction.currency)} {valuationQuestions
                    .filter(q => q.category === 'additions' && valuation[q.id]?.status === 'SI')
                    .reduce((sum, q) => sum + parseArgentineNumber(valuation[q.id]?.amount || '0'), 0)
                    .toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="summary-row">
              <span className="summary-label">TOTAL DE AJUSTES A DEDUCIR:</span>
              <div className="list-monto-group items-end">
                <span className="list-currency-tag text-[9px]">{getCurrencyLabel(transaction.currency)}</span>
                <span className="summary-value deductions-value">
                  − {getCurrencySymbol(transaction.currency)} {valuationQuestions
                    .filter(q => q.category === 'deductions' && valuation[q.id]?.status === 'SI')
                    .reduce((sum, q) => sum + parseArgentineNumber(valuation[q.id]?.amount || '0'), 0)
                    .toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="total-display premium-total-footer">
            <span className="text-xs font-bold opacity-60 uppercase mb-1">VALOR EN ADUANA TOTAL DECLARADO</span>
            <div className="flex items-center gap-3">
              <span className="list-currency-tag px-2 py-1 text-sm">{getCurrencyLabel(transaction.currency)}</span>
              <span className="grand-total">{getCurrencySymbol(transaction.currency)} {getCalculatedValue().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <span className="currency-subtitle mt-1">({getCurrencyName(transaction.currency)})</span>
          </div>
          <div className="form-actions-footer">
            <button 
              type="button" 
              className="btn-draft-large" 
              onClick={saveAsDraft}
              disabled={isSaving}
            >
              GUARDAR COMO BORRADOR
            </button>
            <button type="submit" className={`btn-official-large ${isSaving ? 'is-loading' : ''}`} disabled={isSaving}>
              {isSaving ? (
                <span className="btn-content">
                  <span className="loading-spinner"></span>
                  FINALIZANDO...
                </span>
              ) : (
                'GENERAR DICTAMEN FINAL'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ValuationForm;
