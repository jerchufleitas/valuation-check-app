import React, { useState, useEffect } from 'react';
import ValuationForm from './features/valuation/components/ValuationForm';
import ReportCard from './features/valuation/components/ReportCard';
import { BookOpen, ShieldCheck, LogOut, User } from 'lucide-react';
import './App.css';

import LegalFooter from './components/ui/LegalFooter';
import ChatBot from './components/ui/ChatBot';
import SplashScreen from './components/ui/SplashScreen';
import HistoryList from './features/valuation/components/HistoryList';
import { loginWithGoogle, logout, subscribeToAuthChanges } from './firebase/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [showSplash, setShowSplash] = useState(false);
  const [view, setView] = useState('form'); // 'form' | 'history'

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
    setResult(data);
  };

  const handleReset = () => {
    setResult(null);
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

  // Pantallas de Login si no hay usuario
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <ShieldCheck size={64} className="login-logo" />
          <h1>Valuation Check</h1>
          <p>Herramienta Oficial de Compliance GATT Art. 1 & 8</p>
          <div className="login-divider"></div>
          <button onClick={handleLogin} className="btn-google-login">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Ingresar con Google
          </button>
          <p className="login-footer-text">Acceso restringido para despachantes y exportadores.</p>
        </div>
      </div>
    );
  }

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
        
        <div className="header-actions">
          <nav className="header-tabs">
            <button 
              className={`tab-btn ${view === 'form' ? 'active' : ''}`} 
              onClick={() => { setView('form'); handleReset(); }}
            >
              NUEVA VALORACIÓN
            </button>
            <button 
              className={`tab-btn ${view === 'history' ? 'active' : ''}`} 
              onClick={() => { setView('history'); handleReset(); }}
            >
              HISTORIAL
            </button>
          </nav>

          <div className="user-badge">
            <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
            <span className="user-name">{user.displayName.split(' ')[0]}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout-icon" title="Cerrar Sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="main-content">
        {result ? (
          <ReportCard 
            {...result}
            onReset={handleReset}
          />
        ) : view === 'form' ? (
          <ValuationForm onCalculate={handleCalculate} user={user} />
        ) : (
          <HistoryList 
            user={user} 
            onSelect={(v) => handleCalculate(v)} 
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
