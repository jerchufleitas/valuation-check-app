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
import ClientsPage from './features/clients/ClientsPage';
import Sidebar from './components/layout/Sidebar';
import SettingsPage from './features/settings/SettingsPage';
import { loginWithGoogle, logout, subscribeToAuthChanges } from './firebase/authService';
import { getUserSettings } from './firebase/settingsService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [showSplash, setShowSplash] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'form' | 'history'
  const [editingDraft, setEditingDraft] = useState(null);
  const [userSettings, setUserSettings] = useState(null);

  const fetchSettings = async (userId) => {
    try {
      const settings = await getUserSettings(userId);
      if (settings) setUserSettings(settings);
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  useEffect(() => {
    // Escuchar cambios de autenticación
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchSettings(currentUser.uid);
      }
      setLoading(false);
    });
    
    const hasSeenSplash = sessionStorage.getItem('valuation-check-splash-seen');
    if (!hasSeenSplash) {
      setShowSplash(true);
    }

    // Inicializar tema oscuro si está guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
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

  const handleReset = (dataToEdit) => {
    setResult(null);
    if (dataToEdit && typeof dataToEdit === 'object') {
      setEditingDraft(dataToEdit);
      setView('form');
    } else {
      setEditingDraft(null);
    }
  };

  const handleSetView = (newView) => {
    // Crucial: Clear result when switching views to avoid "Report sticky" bug
    setResult(null);
    setEditingDraft(null);
    setView(newView);
  };

  const handleNewValuationForClient = (client) => {
    // Generar estructura completa para evitar crashes por campos faltantes
    const fullDraft = {
      id: crypto.randomUUID(),
      status: 'BORRADOR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        cliente: client.razonSocial,
        clientId: client.id,
        referencia: '',
        fecha: new Date().toLocaleDateString()
      },
      valoracion: {
        incoterm: client.configDefault?.incoterm || 'FOB',
        precioBase: 0,
        ajustes: {},
        totales: { fob: 0, cif: 0 }
      },
      ncm: { codigo: '', descripcion: '' },
      header: {
        userType: '',
        exporterName: client.razonSocial,
        exporterTaxId: client.cuit,
        importerName: '',
        importerDetails: '',
        transportDocument: '',
        transportMode: 'Terrestre',
        presence: null,
        airportCategory: '',
        airport: '',
        airportOther: '',
        customsCategory: '',
        borderCrossing: '',
      },
      transaction: {
        currency: client.configDefault?.currency || 'DOL',
        incoterm: client.configDefault?.incoterm || 'FOB',
        loadingPlace: '',
        paymentMethod: '',
      },
      item: { ncmCode: '', quantity: '', unit: '', unitValue: '', totalValue: '', description: '' },
      valuation: {},
      documentation: { 
        originCertificateAttached: null, 
        originCertificate: '', 
        invoiceAttached: null, 
        invoiceType: null, 
        invoiceFile: null, 
        insuranceContractAttached: null, 
        insuranceContractFile: null, 
        freightContractAttached: null, 
        freightContractFile: null, 
        purchaseContract: null, 
        purchaseContractFile: null 
      }
    };

    setEditingDraft(fullDraft);
    setResult(null);
    setView('form');
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
          setActivePage={handleSetView} 
          user={user} 
          onLogout={handleLogout} 
          settings={userSettings}
        />
        
        <div className="main-workspace">
          <main className="main-content">
            {result ? (
              <ReportCard 
                {...result}
                onReset={handleReset}
                settings={userSettings}
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
            ) : view === 'history' ? (
              <HistoryList 
                user={user} 
                onSelect={(v) => {
                  if ((v.status || 'BORRADOR') === 'BORRADOR') {
                    setEditingDraft(v);
                    setResult(null);
                    setView('form');
                  } else {
                    handleCalculate(v);
                  }
                }} 
              />
            ) : view === 'clients' ? (
              <ClientsPage 
                user={user} 
                onSelectValuation={(v) => {
                  if ((v.status || 'BORRADOR') === 'BORRADOR') {
                    setEditingDraft(v);
                    setResult(null);
                    setView('form');
                  } else {
                    handleCalculate(v);
                  }
                }}
                onNewValuationForClient={handleNewValuationForClient}
              />
            ) : view === 'settings' ? (
              <SettingsPage 
                user={user} 
                onLogout={handleLogout} 
                onSettingsUpdate={() => fetchSettings(user.uid)}
              />
            ) : (
              <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
                <p className="font-bold uppercase tracking-widest text-sm">Sección en desarrollo...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
