# Registro de Cambios - Valuation Check App

Este documento mantiene un historial de las funcionalidades agregadas, modificadas o eliminadas en el proyecto "Valuation Check: Art. 1 & 8 Expert".

## [v1.2.0] - Estandarización Universal

- **AGREGADO:** Campos de "Descripción de Mercadería" y "Referencia/Cliente" en el formulario principal para identificar cada operación.
- **AGREGADO:** Botón "Nueva Consulta" para limpiar el formulario completamente.
- **MODIFICADO:** El PDF ahora incluye la descripción del producto y la referencia en la tabla de detalles.
- **MEJORA:** Ajuste en el generador de PDF para evitar duplicación de líneas en la sección de detalles.

## [v1.1.0] - Calculadora de Incoterms (CIF Build-up)

- **AGREGADO:** Módulo de lógica de Incoterms (`incotermsLogic.js`).
- **AGREGADO:** Construcción automática de precio CIF a partir de EXW, FOB, etc. (Suma de Fletes y Seguros).
- **AGREGADO:** Visualización en tiempo real del "Valor CIF Calculado" en el formulario.
- **MODIFICADO:** El PDF ahora desglosa el cálculo: Precio Base + Flete + Seguro = Base Imponible.

## [v1.0.1] - Corrección de PDF

- **FIX:** Solucionado error de compatibilidad con `jspdf-autotable` que impedía la descarga del archivo.
- **MEJORA:** Ajuste de diseño en el cuadro de "Resumen Final" del PDF para evitar superposición de texto (Montos y Moneda).

## [v1.0.0] - Lanzamiento Inicial (MVP)

- **INICIO:** Creación del proyecto React + Vite.
- **FEATURE:** Lógica de Valoración basada en GATT Art. 8 y Art. 1 (Adiciones y Deducciones).
- **UI:** Formulario interactivo con checklist de preguntas de valoración.
- **PDF:** Generación de "Dictamen de Valoración" profesional listo para firmar.
- **UX:** Carga de Caso de Ejemplo (Mermelada de Frambuesa).
