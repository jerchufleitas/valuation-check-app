import React, { useState } from 'react';
import ValuationForm from './features/valuation/components/ValuationForm';
import ReportCard from './features/valuation/components/ReportCard';
import { BookOpen, ShieldCheck } from 'lucide-react';
import './App.css';

import LegalFooter from './components/ui/LegalFooter';
import ChatBot from './components/ui/ChatBot';
import SplashScreen from './components/ui/SplashScreen';
import { useEffect } from 'react';

function App() {
  const [result, setResult] = useState(null);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('valuation-check-splash-seen');
    if (!hasSeenSplash) {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('valuation-check-splash-seen', 'true');
  };


  const handleCalculate = (data) => {
    setResult(data);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <ShieldCheck size={32} />
          <div>
            <h1>Valuation Check</h1>
            <span className="subtitle">GATT Art. 1 & 8 Compliance Tool</span>
          </div>
        </div>
        <div className="header-info">
            <span>Ley 23.311</span>
        </div>
      </header>

      <main className="main-content">
        {!result ? (
            <>
              <div className="intro-card">
                <h2>Verificación de Valor en Aduana</h2>
                <p>
                  Herramienta experta para determinar el Valor en Aduana correcto mediante el 
                  análisis de ajustes obligatorios (Art. 8) y deducciones permitidas (Art. 1).
                </p>
              </div>
              <ValuationForm onCalculate={handleCalculate} />
            </>
        ) : (
          <ReportCard 
            baseValue={result.baseValue} 
            adjustments={result.adjustments} 
            currency={result.currency}
            incoterm={result.incoterm}
            productDesc={result.productDesc}
            reference={result.reference}
            onReset={handleReset}
          />
        )}
      </main>
      
      <LegalFooter />
      
      <ChatBot />
    </div>
    </>
  );
}

export default App;
