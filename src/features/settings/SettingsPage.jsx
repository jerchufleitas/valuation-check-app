import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Globe, 
  Moon, 
  Sun, 
  LogOut, 
  Save, 
  ShieldCheck,
  Camera,
  CheckCircle2,
  Layout,
  Palette,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveUserSettings, getUserSettings } from '../../firebase/settingsService';
import { sendVerificationEmail, refreshUserStatus } from '../../firebase/authService';

const SettingsPage = ({ user, onLogout, onSettingsUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Verification Logic
  const [isVerified, setIsVerified] = useState(user.emailVerified);
  const [verifying, setVerifying] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendVerification = async () => {
    setVerifying(true);
    try {
      await sendVerificationEmail(user);
      setEmailSent(true);
      alert("Correo de verificación enviado. Revisa tu bandeja de entrada.");
    } catch (error) {
      console.error(error);
      alert("Error al enviar correo: " + error.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckStatus = async () => {
    setVerifying(true);
    try {
      const status = await refreshUserStatus(user);
      setIsVerified(status);
      if(status) alert("¡Cuenta verificada exitosamente!");
      else alert("Aún no detectamos la verificación. Asegúrate de haber hecho clic en el enlace del correo.");
    } catch (error) {
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  const [formData, setFormData] = useState({
    professionalProfile: {
      signatureName: '',
      registrationNumber: '',
      companyName: '',
      logo: null
    },
    defaults: {
      currency: 'DOL',
      incoterm: 'FOB',
      habitualCustoms: '',
      loadingPoint: ''
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getUserSettings(user.uid);
        if (settings) {
          setFormData(prev => ({
            ...prev,
            ...settings
          }));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [user.uid]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveUserSettings(user.uid, formData);
      setSuccess(true);
      if (onSettingsUpdate) onSettingsUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 200 * 1024) {
        alert("El logo debe pesar menos de 200KB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          professionalProfile: {
            ...prev.professionalProfile,
            logo: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil Profesional', icon: Building2, subtitle: 'Identidad y firma legal' },
    { id: 'defaults', label: 'Preferencias', icon: Globe, subtitle: 'Valores por defecto' },
    { id: 'account', label: 'Cuenta y Apariencia', icon: Palette, subtitle: 'Personalización y sesión' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4a159]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 h-full flex flex-col">
      {/* Main Header with Save Button */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Layout className="text-[#c4a159]" />
            Configuración
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Administra tus preferencias generales del sistema</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
            ${success 
              ? 'bg-green-500 text-white' 
              : 'bg-[#c4a159] hover:bg-[#b89350] text-white shadow-lg shadow-gold-accent/20'}
            ${saving ? 'opacity-70 cursor-wait' : ''}
          `}
        >
          {success ? <CheckCircle2 size={20} /> : saving ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <Save size={20} />}
          {success ? 'GUARDADO' : saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-2">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left
                  ${isActive 
                    ? 'bg-white dark:bg-slate-800 shadow-md border-l-4 border-[#c4a159] text-slate-900 dark:text-white' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400'}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                  ${isActive ? 'bg-[#c4a159]/10 text-[#c4a159]' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}
                `}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className={`font-bold text-sm ${isActive ? 'text-slate-900 dark:text-white' : ''}`}>{tab.label}</p>
                  <p className="text-xs opacity-60 font-medium hidden md:block">{tab.subtitle}</p>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 bg-white dark:bg-slate-800 rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'profile' && (
                <div className="space-y-8 max-w-2xl">
                  <div className="border-b border-slate-100 dark:border-slate-700 pb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Perfil Profesional</h2>
                    <p className="text-slate-500 dark:text-slate-400">Esta información aparecerá en tus dictámenes legales y reportes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Logo Corporativo</label>
                       <div className="flex gap-6 items-start">
                         <div className="relative w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden group hover:border-[#c4a159] transition-colors shrink-0">
                            {formData.professionalProfile.logo ? (
                              <img src={formData.professionalProfile.logo} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                              <Camera className="text-slate-300 dark:text-slate-600" size={32} />
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                         </div>
                         <div className="flex-1 py-2">
                            <h4 className="font-bold text-slate-900 dark:text-white">Imagen de Marca</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">Sube tu logo para personalizar los reportes PDF y la interfaz. Se recomienda formato PNG con fondo transparente.</p>
                            {formData.professionalProfile.logo && (
                              <button 
                                onClick={() => setFormData({...formData, professionalProfile: {...formData.professionalProfile, logo: null}})}
                                className="text-sm text-red-500 hover:text-red-600 font-bold"
                              >
                                Eliminar Logo
                              </button>
                            )}
                         </div>
                       </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Nombre del Estudio / Empresa</label>
                      <input 
                        type="text" 
                        value={formData.professionalProfile.companyName}
                        onChange={e => setFormData({
                          ...formData, 
                          professionalProfile: { ...formData.professionalProfile, companyName: e.target.value }
                        })}
                        placeholder="Ej: Pérez & Asociados Comex"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none focus:border-[#c4a159] focus:ring-4 focus:ring-[#c4a159]/10 font-medium transition-all dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Firma del Despachante</label>
                      <input 
                        type="text" 
                        value={formData.professionalProfile.signatureName}
                        onChange={e => setFormData({
                          ...formData, 
                          professionalProfile: { ...formData.professionalProfile, signatureName: e.target.value }
                        })}
                        placeholder="Nombre y Apellido"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none focus:border-[#c4a159] focus:ring-4 focus:ring-[#c4a159]/10 font-medium transition-all dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Nº Registro / Matrícula</label>
                      <input 
                        type="text" 
                        value={formData.professionalProfile.registrationNumber}
                        onChange={e => setFormData({
                          ...formData, 
                          professionalProfile: { ...formData.professionalProfile, registrationNumber: e.target.value }
                        })}
                        placeholder="Ej: 99999/X"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none focus:border-[#c4a159] focus:ring-4 focus:ring-[#c4a159]/10 font-medium transition-all dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'defaults' && (
                <div className="space-y-8 max-w-2xl">
                  <div className="border-b border-slate-100 dark:border-slate-700 pb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Preferencias Operativas</h2>
                    <p className="text-slate-500 dark:text-slate-400">Configura los valores predeterminados para nuevas valoraciones.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Moneda Principal</label>
                      <select 
                        value={formData.defaults.currency}
                        onChange={e => setFormData({
                          ...formData, 
                          defaults: { ...formData.defaults, currency: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none focus:border-[#c4a159] font-medium transition-all dark:text-white"
                      >
                        <option value="DOL">Dólares Estadounidenses (USD)</option>
                        <option value="EUR">Euros (EUR)</option>
                        <option value="PES">Pesos Argentinos (ARS)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Incoterm Habitual</label>
                      <select 
                        value={formData.defaults.incoterm}
                        onChange={e => setFormData({
                          ...formData, 
                          defaults: { ...formData.defaults, incoterm: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none focus:border-[#c4a159] font-medium transition-all dark:text-white"
                      >
                         <option value="FOB">FOB (Puerto Carga)</option>
                         <option value="FCA">FCA (Lugar Entrega)</option>
                         <option value="EXW">EXW (En Fábrica)</option>
                         <option value="CIF">CIF (Costo, Seg y Flete)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Aduana Jurisdicción</label>
                      <input 
                        type="text" 
                        value={formData.defaults.habitualCustoms}
                        onChange={e => setFormData({
                          ...formData, 
                          defaults: { ...formData.defaults, habitualCustoms: e.target.value }
                        })}
                        placeholder="Ej: BUENOS AIRES"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none focus:border-[#c4a159] focus:ring-4 focus:ring-[#c4a159]/10 font-medium transition-all dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Punto de Carga Default</label>
                      <input 
                        type="text" 
                        value={formData.defaults.loadingPoint}
                        onChange={e => setFormData({
                          ...formData, 
                          defaults: { ...formData.defaults, loadingPoint: e.target.value }
                        })}
                        placeholder="Ej: Ezeiza / Puerto Nuevo"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none focus:border-[#c4a159] focus:ring-4 focus:ring-[#c4a159]/10 font-medium transition-all dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8 max-w-2xl">
                  <div className="border-b border-slate-100 dark:border-slate-700 pb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cuenta y Apariencia</h2>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona tu sesión y estilo visual.</p>
                  </div>

                  {/* Themes */}
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Palette size={18} className="text-[#c4a159]" /> Apariencia
                    </h3>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => !darkMode && toggleDarkMode()} 
                        className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${darkMode ? 'border-[#c4a159] bg-[#c4a159]/5' : 'border-slate-200 dark:border-slate-700 cursor-pointer'}`}
                      >
                         <Moon size={24} className={darkMode ? 'text-[#c4a159]' : 'text-slate-400'} />
                         <span className={`font-bold ${darkMode ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Oscuro</span>
                      </button>
                      <button 
                        onClick={() => darkMode && toggleDarkMode()} 
                        className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${!darkMode ? 'border-[#c4a159] bg-[#c4a159]/5' : 'border-slate-200 dark:border-slate-700 cursor-pointer'}`}
                      >
                         <Sun size={24} className={!darkMode ? 'text-[#c4a159]' : 'text-slate-400'} />
                         <span className={`font-bold ${!darkMode ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Claro</span>
                      </button>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <img src={user.photoURL} alt={user.displayName} className="w-16 h-16 rounded-full border-2 border-white dark:border-slate-600 shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{user.displayName}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{user.email}</p>
                      {isVerified ? (
                        <div className="flex items-center gap-1 mt-1 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
                           <ShieldCheck size={12} /> Cuenta Verificada
                        </div>
                      ) : (
                        <div className="mt-2">
                          <div className="flex items-center gap-1 text-amber-500 font-bold uppercase tracking-wider text-xs mb-1">
                             <AlertTriangle size={12} /> No Verificado
                          </div>
                          {!emailSent ? (
                             <button 
                               onClick={handleSendVerification} 
                               disabled={verifying}
                               className="text-xs font-bold text-[#c4a159] hover:text-[#b89350] hover:underline disabled:opacity-50 flex items-center gap-1"
                             >
                               {verifying && <Loader2 size={10} className="animate-spin" />}
                               Verificar ahora (Enviar E-mail)
                             </button>
                          ) : (
                             <div className="flex flex-col items-start gap-1">
                                 <span className="text-[10px] text-slate-400">Correo enviado a tu casilla.</span>
                                 <button 
                                   onClick={handleCheckStatus} 
                                   disabled={verifying}
                                   className="text-xs font-bold text-blue-500 hover:text-blue-400 hover:underline disabled:opacity-50 flex items-center gap-1"
                                 >
                                   {verifying && <Loader2 size={10} className="animate-spin" />}
                                   Ya verifiqué, actualizar
                                 </button>
                             </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={onLogout}
                    className="w-full p-4 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={20} />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
