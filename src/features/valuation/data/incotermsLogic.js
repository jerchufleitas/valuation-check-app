export const incoterms = [
  { code: 'EXW', name: 'Ex Works', requiresFreight: true, requiresInsurance: true },
  { code: 'FCA', name: 'Free Carrier', requiresFreight: true, requiresInsurance: true },
  { code: 'FAS', name: 'Free Alongside Ship', requiresFreight: true, requiresInsurance: true },
  { code: 'FOB', name: 'Free on Board', requiresFreight: true, requiresInsurance: true },
  { code: 'CFR', name: 'Cost and Freight', requiresFreight: false, requiresInsurance: true },
  { code: 'CPT', name: 'Carriage Paid To', requiresFreight: false, requiresInsurance: true },
  { code: 'CIF', name: 'Cost, Insurance & Freight', requiresFreight: false, requiresInsurance: false },
  { code: 'CIP', name: 'Carriage and Insurance Paid', requiresFreight: false, requiresInsurance: false },
  { code: 'DAP', name: 'Delivered at Place', requiresFreight: false, requiresInsurance: false },
  { code: 'DPU', name: 'Delivered at Place Unloaded', requiresFreight: false, requiresInsurance: false },
  { code: 'DDP', name: 'Delivered Duty Paid', requiresFreight: false, requiresInsurance: false },
];

export const calculateCIF = (base, freight, insurance) => {
  return parseFloat(base || 0) + parseFloat(freight || 0) + parseFloat(insurance || 0);
};
