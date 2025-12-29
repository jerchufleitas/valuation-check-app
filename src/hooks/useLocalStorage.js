import { useState, useEffect } from 'react';
import { toPlainObject } from '../utils/serialization';

const parseArgentineNumber = (value) => {
  if (typeof value !== 'string') return value;
  // Regla de Oro: Eliminar puntos (miles) y cambiar coma por punto (decimal JS)
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

const formatArgentineNumber = (value) => {
  const num = typeof value === 'string' ? parseArgentineNumber(value) : value;
  return (num || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const useLocalStorage = (key, initialValue) => {
  // Estado para almacenar el valor
  // Se inicializa con el valor de localStorage o el valor inicial
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Migración: Si tiene 'header' pero no 'id', envolverlo en la nueva estructura
        if (parsed && parsed.header && !parsed.id) {
          return {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {
              cliente: parsed.header.importerName || '',
              referencia: parsed.header.transportDocument || '',
              fecha: new Date().toLocaleDateString()
            },
            valoracion: {
              incoterm: parsed.transaction?.incoterm || 'FOB',
              precioBase: parseFloat(parsed.item?.totalValue || 0),
              ajustes: parsed.valuation || {},
              totales: { fob: 0, cif: 0 } // Se calcularán en el componente
            },
            ncm: { 
              codigo: parsed.item?.ncmCode || '', 
              descripcion: parsed.item?.description || '' 
            },
            // Mantener el resto de los bloques para no perder datos de UI
            ...parsed
          };
        }
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.error("Error reading localStorage key “" + key + "”: ", error);
      return initialValue;
    }
  });

  // Cada vez que storedValue cambie, actualizamos localStorage
  useEffect(() => {
    try {
      const sanitizedValue = toPlainObject({
        ...storedValue,
        updatedAt: new Date().toISOString()
      });
      window.localStorage.setItem(key, JSON.stringify(sanitizedValue));
    } catch (error) {
      console.error("Error setting localStorage key “" + key + "”: ", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
