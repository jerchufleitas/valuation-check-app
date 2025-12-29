import React, { useState, useEffect } from 'react';
import ValuationForm from './features/valuation/components/ValuationForm';
import ReportCard from './features/valuation/components/ReportCard';
import { BookOpen, ShieldCheck, LogOut, User } from 'lucide-react';
import './App.css';

import LegalFooter from './components/ui/LegalFooter';
import SplashScreen from './components/ui/SplashScreen';
import HistoryList from './features/valuation/components/HistoryList';
import DashboardPage from './features/dashboard/DashboardPage';
import LandingPage from './features/landing/LandingPage';
import Sidebar from './components/layout/Sidebar';
import { loginWithGoogle, logout, subscribeToAuthChanges } from './firebase/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [showSplash, setShowSplash] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'form' | 'history'
  const [editingDraft, setEditingDraft] = useState(null);

  useEffect(() => {
    // Escuchar cambios de autenticación
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    const hasSeenSplash = sessionStorage.getItem('valuation-check-splash-seen');
    if (!hasSeenSplash) {
      setShowSplash(true);
    }

    return () => unsubscribe();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('valuation-check-splash-seen', 'true');
  };

  const handleCalculate = (data) => {
    // Normalizar la data para que el ReportCard siempre reciba lo que espera
    // Caso 1: Viene del ValuationForm (ya tiene finalValue, blocks, summary)
    if (data.blocks && data.finalValue !== undefined) {
      setResult(data);
    } 
    // Caso 2: Viene del Historial (es el objeto plano guardado en Firestore)
    else {
      setResult({
        finalValue: data.valoracion?.totales?.fob || 0,
        blocks: data,
        summary: {
          exporter: data.header?.exporterName || '',
          importer: data.header?.importerName || '',
          ncm: data.item?.ncmCode || '',
          incoterm: data.transaction?.incoterm || 'FOB'
        }
      });
    }
  };

  const handleReset = () => {
    setResult(null);
    setEditingDraft(null);
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      alert("Error al iniciar sesión. Por favor, intenta de nuevo.");
    }
  };

  const handleLogout = () => {
    if(window.confirm("¿Seguro que quieres cerrar sesión?")) {
      logout();
      setResult(null);
    }
  };

  if (loading) {
    return (
      <div className="app-loader">
        <div className="loading-spinner large"></div>
        <p>Iniciando sistema seguro...</p>
      </div>
    );
  }

  // Pantalla de Landing si no hay usuario
  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className="app-layout">
        <Sidebar 
          activePage={view} 
          setActivePage={(v) => { setView(v); handleReset(); }} 
          user={user} 
          onLogout={handleLogout} 
        />
        
        <div className="main-workspace">
          <main className="main-content">
            {result ? (
              <ReportCard 
                {...result}
                onReset={handleReset}
              />
            ) : view === 'dashboard' ? (
              <DashboardPage 
                user={user} 
                onNewValuation={() => { setEditingDraft(null); setView('form'); }} 
                setView={setView}
                onSelect={(v) => {
                  if ((v.status || 'BORRADOR') === 'BORRADOR') {
                    setEditingDraft(v);
                    setResult(null); // Ensure result is cleared
                    setView('form');
                  } else {
                    handleCalculate(v);
                  }
                }} 
              />
            ) : view === 'form' ? (
              <ValuationForm 
                onCalculate={handleCalculate} 
                user={user} 
                initialData={editingDraft} 
              />
            ) : (
              <HistoryList 
                user={user} 
                onSelect={(v) => {
                  if ((v.status || 'BORRADOR') === 'BORRADOR') {
                    setEditingDraft(v);
                    setView('form');
                  } else {
                    handleCalculate(v);
                  }
                }} 
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
