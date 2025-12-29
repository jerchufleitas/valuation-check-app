import React from 'react';

const LegalFooter = ({ isDark = false }) => {
    return (
        <footer className={`app-footer ${isDark ? 'is-dark' : ''}`} style={{
            textAlign: 'center', 
            padding: '4rem 1rem 2rem 1rem', 
            color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'var(--text-muted)', 
            borderTop: isDark ? 'none' : '1px solid var(--border-color)',
            marginTop: 'auto',
            background: isDark ? 'transparent' : 'var(--bg-color)',
            width: '100%'
        }}>
            <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: isDark ? '#c4a159' : 'inherit' }}>
                © {new Date().getFullYear()} Valuation Check - Herramienta de Cálculo Auxiliar
            </p>
            <p style={{ fontSize: '0.7rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.5' }}>
                Este documento y sus resultados son un Dictamen Técnico Auxiliar basado en el Acuerdo del GATT (Art. 1 y 8) y la Ley 23.311. 
                Su uso es responsabilidad exclusiva del profesional aduanero. Valuation Check no se responsabiliza por la exactitud de los datos ingresados 
                ni por resoluciones de la autoridad aduanera. No reemplaza el asesoramiento profesional oficial.
            </p>
        </footer>
    );
};

export default LegalFooter;
