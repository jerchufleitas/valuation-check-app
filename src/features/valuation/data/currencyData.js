export const currencyData = [
    { code: 'DOL', name: 'DOLAR ESTADOUNIDENSE', symbol: 'US$' },
    { code: 'PES', name: 'PESOS', symbol: '$' },
    { code: '009', name: 'FRANCOS SUIZOS', symbol: 'Fr.' },
    { code: '010', name: 'PESOS MEJICANOS', symbol: '$' },
    { code: '011', name: 'PESOS URUGUAYOS', symbol: '$' },
    { code: '012', name: 'REAL', symbol: 'R$' },
    { code: '014', name: 'CORONAS DANESAS', symbol: 'kr' },
    { code: '015', name: 'CORONAS NORUEGAS', symbol: 'kr' },
    { code: '016', name: 'CORONAS SUECAS', symbol: 'kr' },
    { code: '018', name: 'DOLAR CANADIENSE', symbol: '$' },
    { code: '019', name: 'YENS', symbol: '¥' },
    { code: '021', name: 'LIBRA ESTERLINA', symbol: '£' },
    { code: '023', name: 'BOLIVAR', symbol: 'Bs.' },
    { code: '024', name: 'CORONA CHECA', symbol: 'Kč' },
    { code: '025', name: 'DINAR', symbol: 'din' },
    { code: '026', name: 'DOLAR AUSTRALIANO', symbol: '$' },
    { code: '028', name: 'FLORIN(ANTILLAS HOLA)', symbol: 'ƒ' },
    { code: '029', name: 'GUARANI', symbol: '₲' },
    { code: '030', name: 'SHEKEL(ISRAEL)', symbol: '₪' },
    { code: '031', name: 'PESO BOLIVIANO', symbol: 'Bs.' },
    { code: '032', name: 'PESO COLOMBIANO', symbol: '$' },
    { code: '033', name: 'PESO CHILENO', symbol: '$' },
    { code: '034', name: 'RAND', symbol: 'R' },
    { code: '035', name: 'NUEVO SOL PERUANO', symbol: 'S/.' },
    { code: '036', name: 'SUCRE', symbol: 'S/.' },
    { code: '055', name: 'QUETZAL', symbol: 'Q' },
    { code: '056', name: 'FORINT (HUNGRIA)', symbol: 'Ft' },
    { code: '057', name: 'BAHT (TAILANDIA)', symbol: '฿' },
    { code: '059', name: 'DINAR KUWAITI', symbol: 'KD' },
    { code: '060', name: 'EURO', symbol: '€' },
    { code: '061', name: 'YUAN', symbol: '¥' },
    { code: '062', name: 'RUBLO RUSO', symbol: '₽' },
    { code: '063', name: 'DOLAR NEOZELANDES', symbol: '$' }
];

export const getCurrencySymbol = (code) => {
    const curr = currencyData.find(c => c.code === code);
    return curr ? curr.symbol : '$';
};

export const getCurrencyName = (code) => {
    const curr = currencyData.find(c => c.code === code);
    return curr ? curr.name : '';
};
