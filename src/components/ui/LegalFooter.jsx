import React from 'react';

const LegalFooter = () => {
    return (
        <footer className="app-footer" style={{
            textAlign: 'center', 
            padding: '2rem 1rem', 
            color: 'var(--text-muted)', 
            borderTop: '1px solid var(--border-color)',
            marginTop: 'auto',
            background: 'var(--bg-color)'
        }}>
            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                © {new Date().getFullYear()} Valuation Check - Herramienta de Cálculo Auxiliar
            </p>
            <p style={{ fontSize: '0.8rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.5', opacity: 0.8 }}>
                Este documento y sus resultados son un Dictamen Técnico Auxiliar basado en el Acuerdo del GATT (Art. 1 y 8) y la Ley 23.311. 
                Su uso es responsabilidad exclusiva del profesional aduanero. Valuation Check no se responsabiliza por la exactitud de los datos ingresados 
                ni por resoluciones de la autoridad aduanera. No reemplaza el asesoramiento profesional oficial.
            </p>
        </footer>
    );
};

export default LegalFooter;
