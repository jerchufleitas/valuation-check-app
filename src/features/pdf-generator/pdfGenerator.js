import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// -- Shared Helper Functions --

// Helper to handle UTF-8 chars in standard PDF fonts (Latin-1 mapping)
const t = (str) => {
  if (!str) return "";
  return str
    .replace(/á/g, '\xE1').replace(/Á/g, '\xC1')
    .replace(/é/g, '\xE9').replace(/É/g, '\xC9')
    .replace(/í/g, '\xED').replace(/Í/g, '\xCD')
    .replace(/ó/g, '\xF3').replace(/Ó/g, '\xD3')
    .replace(/ú/g, '\xFA').replace(/Ú/g, '\xDA')
    .replace(/ñ/g, '\xF1').replace(/Ñ/g, '\xD1')
    .replace(/º/g, '\xBA');
};

const getFinancials = (data) => {
  const totalAdditions = data.adjustments
    .filter(a => a.type === 'addition')
    .reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
  
  const totalDeductions = data.adjustments
    .filter(a => a.type === 'deduction')
    .reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
    
  const finalValue = parseFloat(data.baseValue) + totalAdditions - totalDeductions;
  
  return { totalAdditions, totalDeductions, finalValue };
};

const drawHeader = (doc, title, subtitle, verificationId, pageWidth) => {
    const primaryColor = [15, 23, 42]; // #0f172a
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(t(title), 20, 20);
    
    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(t(subtitle), 20, 28);
    }
    
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 20, 20, { align: 'right' });
    doc.setFontSize(8);
    doc.text(`ID Verif: ${verificationId}`, pageWidth - 20, 28, { align: 'right' });
};

const drawFooter = (doc, verificationId, pageHeight, isLegal = false) => {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(t(`Documento generado por Valuation Check - ID Verificación: ${verificationId}`), 20, pageHeight - 15);
    
    if (!isLegal) {
       doc.text(t("Reporte de uso interno/comercial. No válido como declaración jurada sin firma."), 20, pageHeight - 10);
    }
};

// --- RENDERER A: TECHNICAL (Auditoría) ---
const renderTechnicalPDF = (doc, data, verificationId, pageWidth, pageHeight) => {
  drawHeader(doc, "PLANILLA TÉCNICA DE EXPORTACIÓN", "Análisis de Valor Imponible MERCOSUR", verificationId, pageWidth);
  
  const { totalAdditions, totalDeductions, finalValue } = getFinancials(data);
  let yPos = 50;

  // 1. Data Dump Table
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(t("1. Datos Base de la Operación"), 20, yPos);
  yPos += 8;

  const breakdown = data.breakdown || {};
  const techData = [
    [t("Exportador"), t(`${data.exporter?.name || 'N/A'} (ID: ${data.exporter?.id || '-'})`)],
    [t("Posición NCM"), t(data.ncmCode || "N/A")],
    [t("Mercadería"), t(data.productDesc || "N/A")],
    [t("Vía/Embarque"), t(`${data.transport?.mode || 'N/A'} / ${data.transport?.loading || '-'}`)],
    [t("CRT/Certificado"), t(`${data.documents?.crt || 'N/A'} / ${data.documents?.origin || '-'}`)],
    ["Incoterm", breakdown.incoterm || data.incoterm],
    [t("Precio Factura"), `${data.currency} ${parseFloat(breakdown.basePrice || data.baseValue).toLocaleString()}`],
    [t("Flete Int."), `${data.currency} ${parseFloat(breakdown.freight || 0).toLocaleString()}`],
    [t("Seguro Int."), `${data.currency} ${parseFloat(breakdown.insurance || 0).toLocaleString()}`],
    [t("V. Imponible Base"), `${data.currency} ${parseFloat(data.baseValue).toLocaleString()}`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Campo', 'Valor Declarado']],
    body: techData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
  });
  
  yPos = doc.lastAutoTable.finalY + 15;

  // 2. Adjustments Detailed Table
  doc.setFontSize(12);
  doc.text(t("2. Desglose de Ajustes (Art. 8 GATT)"), 20, yPos);
  yPos += 8;
  
  if (data.adjustments.length === 0) {
      doc.setFontSize(10);
      doc.text(t("No se registraron ajustes de valoración."), 20, yPos);
      yPos += 10;
  } else {
      const adjBody = data.adjustments.map(a => [
          a.id, 
          t(a.text), 
          a.type === 'addition' ? '(+) SUMA' : '(-) RESTA',
          `${data.currency} ${parseFloat(a.amount).toLocaleString()}`
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['ID', 'Concepto', 'Impacto', 'Monto']],
        body: adjBody,
        theme: 'grid',
        styles: { fontSize: 8, overflow: 'linebreak' },
        columnStyles: { 1: { cellWidth: 80 } }
      });
      yPos = doc.lastAutoTable.finalY + 15;
  }

  // Check storage for overlaps
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 30;
  }

  // 3. Final Calculation Block (Tech style)
  doc.setFillColor(240);
  doc.rect(20, yPos, 120, 45, 'F');
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(t("CÁLCULO FINAL:"), 25, yPos + 10);
  doc.text(t(`Base Factura: ${data.currency} ${parseFloat(data.baseValue).toLocaleString()}`), 25, yPos + 20);
  doc.text(t(`Total Ajustes: ${data.currency} ${(totalAdditions - totalDeductions).toLocaleString()}`), 25, yPos + 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t(`VALOR IMPONIBLE EXPO: ${data.currency} ${finalValue.toLocaleString()}`), 25, yPos + 40);

  drawFooter(doc, verificationId, pageHeight, false);
};

// --- RENDERER B: COMMERCIAL (Cliente) ---
const renderCommercialPDF = (doc, data, verificationId, pageWidth, pageHeight) => {
  // Brand Header
  doc.setFillColor(255, 255, 255); // White bg
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Clean Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(t("Resumen de Valoración"), 20, 25);
  
  // Gold Line
  doc.setDrawColor(196, 161, 89);
  doc.setLineWidth(1);
  doc.line(20, 32, pageWidth - 20, 32);

  const { finalValue } = getFinancials(data);
  let yPos = 50;

  // Client Info
  doc.setFontSize(14);
  const clientText = `Exportador: ${data.exporter?.name || "General"}`;
  doc.text(t(clientText.substring(0, 45) + (clientText.length>45?"...":"")), 20, yPos);
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(t(`${data.productDesc || "Mercadería"} - NCM ${data.ncmCode || '-'}`), 20, yPos);
  
  yPos += 20;

  // Big Numbers Cards
  doc.setFillColor(15, 23, 42); // Navy Box
  doc.roundedRect(20, yPos, pageWidth - 40, 50, 4, 4, 'F');
  
  doc.setTextColor(255);
  doc.setFontSize(10);
  doc.text(t("VALOR IMPONIBLE DEFINITIVO (FOB/FCA + AJUSTES)"), 35, yPos + 15);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.currency} ${finalValue.toLocaleString()}`, 35, yPos + 35);
  
  yPos += 70;

  // Simple Explainer
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(t("Composición del Valor:"), 20, yPos);
  yPos += 10;
  
  const breakdown = data.breakdown || {};
  const freight = parseFloat(breakdown.freight || 0);
  const insurance = parseFloat(breakdown.insurance || 0);
  const totalAdj = parseFloat(data.baseValue) + getFinancials(data).totalAdditions - getFinancials(data).totalDeductions - parseFloat(breakdown.basePrice || 0) - freight - insurance;

  const simpleData = [
    [t("Costo Producto (FOB/FCA)"), `${data.currency} ${parseFloat(breakdown.basePrice || 0).toLocaleString()}`],
    [t("Logística Internacional (Flete+Seguro)"), `${data.currency} ${(freight + insurance).toLocaleString()}`],
    [t("Ajustes de Valoración"), `${data.currency} ${totalAdj.toLocaleString()}`], 
  ];

  autoTable(doc, {
      startY: yPos,
      body: simpleData,
      theme: 'plain',
      styles: { fontSize: 12, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: 'bold'}, 1: { halign: 'right' } }
  });

  drawFooter(doc, verificationId, pageHeight, false);
};

// --- RENDERER C: LEGAL (Arca/Aduana) ---
const renderLegalPDF = (doc, data, verificationId, pageWidth, pageHeight) => {
  drawHeader(doc, "DICTAMEN TÉCNICO DE EXPORTACIÓN", "Determinación de Valor Imponible MERCOSUR", verificationId, pageWidth);
  
  const { totalAdditions, totalDeductions, finalValue } = getFinancials(data);
  let yPos = 60; // Start lower to give breathing room

  const marginX = 20;
  const labelWidth = 35;
  const contentX = marginX + labelWidth;
  const maxContentWidth = pageWidth - contentX - marginX;

  // 1. VISTO
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(t("VISTO:"), marginX, yPos);
  
  doc.setFont('helvetica', 'normal');
  const vistoText = t(`La operación de exportación de "${data.productDesc || 'mercadería'}" realizada por el exportador "${data.exporter?.name || 'S/D'}" (ID Fiscal ${data.exporter?.id || '-'}), bajo condiciones de venta ${data.incoterm || 'S/D'}, amparada por CRT ${data.documents?.crt || '-'} y Certificado de Origen ${data.documents?.origin || '-'}.`);
  const splitVisto = doc.splitTextToSize(vistoText, maxContentWidth);
  
  doc.text(splitVisto, contentX, yPos);
  
  // Calculate height of the text block + padding
  const vistoHeight = splitVisto.length * 5; // approx 5 units per line
  yPos += vistoHeight + 10; // Add breathing room

  // 2. CONSIDERANDO
  doc.setFont('helvetica', 'bold');
  doc.text(t("CONSIDERANDO:"), marginX, yPos);
  
  doc.setFont('helvetica', 'normal');
  const condText = t("Que se ha procedido a la determinación del valor imponible según las normas de valoración del MERCOSUR. Que se han analizado los ajustes de valor previstos en la normativa para alcanzar la base de imposición a la exportación.");
  const splitCond = doc.splitTextToSize(condText, maxContentWidth);
  
  doc.text(splitCond, contentX, yPos);
  
  const condHeight = splitCond.length * 5;
  yPos += condHeight + 15; // More breathing room before table

  // 3. SE DICTAMINA (Table)
  doc.setFont('helvetica', 'bold');
  doc.text(t("SE DICTAMINA:"), marginX, yPos);
  yPos += 8;

  const legalBody = [
      [t("PRECIO FACTURA BASE"), `${data.currency} ${parseFloat(data.baseValue).toLocaleString()}`],
      ...data.adjustments.map(a => [t(`AJUSTE (${a.text})`), `${a.type==='addition'?'+':'-'} ${parseFloat(a.amount).toLocaleString()}`]),
      [t("VALOR IMPONIBLE DETERMINADO"), `${data.currency} ${finalValue.toLocaleString()}`]
  ];

  autoTable(doc, {
      startY: yPos,
      body: legalBody,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4, overflow: 'linebreak' }, // Added padding
      columnStyles: { 0: {width: 120}, 1: {halign: 'right', fontStyle: 'bold'} }
  });


  // Verification ID & Signature Area
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`ID Verificación: ${verificationId}`, 25, pageHeight - 35);
  
  // Disclaimer
  doc.setDrawColor(200);
  doc.setFillColor(245, 245, 245);
  doc.rect(20, pageHeight - 65, pageWidth - 40, 25, 'F');
  doc.setFontSize(7);
  doc.setTextColor(80);
  doc.setFont('helvetica', 'normal');
  const disclaimerText = t("AVISO LEGAL IMPORTANTE: Este documento es un Dictamen Técnico Auxiliar basado en las Normas de Valoración del MERCOSUR y leyes de exportación vigentes. Su uso es responsabilidad exclusiva del profesional aduanero. Valuation Check no se responsabiliza por la exactitud de los datos ingresados ni por resoluciones de la autoridad aduanera. Este reporte carece de validez oficial si no está acompañado por la firma del despachante.");
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, pageWidth - 50);
  doc.text(splitDisclaimer, 25, pageHeight - 60);

   // Signature line
    doc.setDrawColor(0);
    doc.line(120, pageHeight - 30, 190, pageHeight - 30);
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(t("Firma y Sello del Despachante"), 120, pageHeight - 25);
};


// --- MAIN EXPORT FUNCTION ---
export const generateValuationPDF = (data, format = 'technical') => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Generate Unique ID
    const verificationId = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Select Renderer
    if (format === 'technical') {
        renderTechnicalPDF(doc, data, verificationId, pageWidth, pageHeight);
    } else if (format === 'commercial') {
        renderCommercialPDF(doc, data, verificationId, pageWidth, pageHeight);
    } else if (format === 'legal') {
        renderLegalPDF(doc, data, verificationId, pageWidth, pageHeight);
    } else {
        renderTechnicalPDF(doc, data, verificationId, pageWidth, pageHeight); // Fallback
    }

    doc.save(`Reporte_ValCheck_${format}_${verificationId}.pdf`);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    alert("Error generando el PDF. Por favor verifique la consola.\n" + error.message);
  }
};
