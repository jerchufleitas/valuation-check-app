// RG 2010/2006 - DECLARACIÓN DE VALOR EN ADUANA
// 17 Preguntas Oficiales organizadas por categoría

export const valuationQuestions = [
  // ============================================
  // SUB-BLOQUE 1: CONDICIONES GENERALES Y VINCULACIÓN
  // ============================================
  {
    id: "q01_discounts",
    category: "general",
    number: 1,
    text: "¿Hay descuentos no indicados en la factura?",
    requiresAmount: false,
    legal: "RG 2010/2006 - Pregunta 1"
  },
  {
    id: "q02_price_adjustable",
    category: "general",
    number: 2,
    text: "¿El precio es revisable o sujeto a ajustes posteriores?",
    requiresAmount: false,
    legal: "RG 2010/2006 - Pregunta 2"
  },
  {
    id: "q03_prior_resolution",
    category: "general",
    number: 3,
    text: "¿Existe resolución aduanera previa relativa a los ítems señalados en los puntos 5 a 9?",
    requiresAmount: false,
    legal: "RG 2010/2006 - Pregunta 3"
  },
  {
    id: "q04_staged_shipment",
    category: "general",
    number: 4,
    text: "¿El embarque es escalonado?",
    requiresAmount: false,
    legal: "RG 2010/2006 - Pregunta 4"
  },
  {
    id: "q05_related_parties",
    category: "general",
    number: 5,
    text: "¿El comprador y el vendedor están vinculados (Art. 15, párrafo 4 del Acuerdo de Valoración)?",
    requiresAmount: false,
    legal: "RG 2010/2006 - Pregunta 5"
  },
  {
    id: "q06_restrictions",
    category: "general",
    number: 6,
    text: "¿Existen restricciones para la cesión o utilización de las mercaderías por el comprador?",
    requiresAmount: false,
    legal: "RG 2010/2006 - Pregunta 6"
  },
  {
    id: "q07_conditions",
    category: "general",
    number: 7,
    text: "¿Dependen la venta o el precio de condiciones o contraprestaciones cuyo valor no pueda determinarse?",
    requiresAmount: false,
    legal: "RG 2010/2006 - Pregunta 7"
  },

  // ============================================
  // SUB-BLOQUE 2: ADICIONES AL PRECIO
  // ============================================
  {
    id: "q08_royalties",
    category: "additions",
    number: 8,
    text: "¿Existen cánones y derechos de licencia (royalties) relativos a las mercaderías?",
    requiresAmount: true,
    legal: "RG 2010/2006 - Pregunta 8",
    inputLabel: "Monto de royalties"
  },
  {
    id: "q09_resale_reversion",
    category: "additions",
    number: 9,
    text: "¿La venta está condicionada a que parte del producto de reventa revierta al vendedor?",
    requiresAmount: true,
    legal: "RG 2010/2006 - Pregunta 9",
    inputLabel: "Monto de reversión"
  },
  {
    id: "q10_indirect_payments",
    category: "additions",
    number: 10,
    text: "¿Existen pagos indirectos realizados al vendedor o a un tercero?",
    requiresAmount: true,
    legal: "RG 2010/2006 - Pregunta 10",
    inputLabel: "Monto de pagos indirectos"
  },
  {
    id: "q11_commissions",
    category: "additions",
    number: 11,
    text: "¿Existen comisiones (excepto compra), corretajes, o gastos de envases y embalajes?",
    requiresAmount: true,
    legal: "RG 2010/2006 - Pregunta 11",
    inputLabel: "Monto de comisiones/embalajes"
  },
  {
    id: "q12_buyer_assistance",
    category: "additions",
    number: 12,
    text: "¿Existen bienes y servicios suministrados por el comprador gratuitamente o a precio reducido (asistencias)?",
    requiresAmount: true,
    legal: "RG 2010/2006 - Pregunta 12",
    inputLabel: "Valor de asistencias"
  },
  {
    id: "q13_resale_product",
    category: "additions",
    number: 13,
    text: "¿Existe un producto de cualquier reventa posterior que revierta al vendedor?",
    requiresAmount: true,
    legal: "RG 2010/2006 - Pregunta 13",
    inputLabel: "Monto de reversión de reventa"
  },
  {
    id: "q17_handling_costs",
    category: "additions",
    number: 14,
    text: "¿Existen gastos de carga, descarga y manipulación hasta el punto de importación discriminados aparte?",
    requiresAmount: true,
    legal: "RG 2010/2006 - Pregunta 17",
    inputLabel: "Gastos de manipulación"
  },

  // ============================================
  // SUB-BLOQUE 3: DEDUCCIONES AL PRECIO
  // ============================================
  {
    id: "q14_financing_interest",
    category: "deductions",
    number: 15,
    text: "¿Existen intereses por financiación pactados en la operación?",
    requiresAmount: true,
    legal: "RG 2010/2006 - Pregunta 14",
    inputLabel: "Monto de intereses"
  },
  {
    id: "q15_post_import_services",
    category: "deductions",
    number: 16,
    text: "¿Existen gastos de construcción, montaje, mantenimiento o asistencia técnica realizados DESPUÉS de la importación?",
    requiresAmount: true,
    legal: "RG 2010/2006 - Pregunta 15",
    inputLabel: "Gastos post-importación"
  },
  {
    id: "q16_import_duties",
    category: "deductions",
    number: 17,
    text: "¿Existen derechos y demás tributos a pagar en Argentina como consecuencia de la importación?",
    requiresAmount: true,
    legal: "RG 2010/2006 - Pregunta 16",
    inputLabel: "Tributos de importación"
  }
];

// Función auxiliar para obtener preguntas por categoría
export const getQuestionsByCategory = (category) => {
  return valuationQuestions.filter(q => q.category === category);
};

// Exportar también el array antiguo para compatibilidad temporal
export const adjustmentQuestions = [];
