import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  CreditCard, 
  Globe, 
  Moon, 
  Sun, 
  LogOut, 
  Save, 
  ShieldCheck,
  FileText,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveUserSettings, getUserSettings } from '../../firebase/settingsService';

const SettingsPage = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [formData, setFormData] = useState({
    professionalProfile: {
      signatureName: '',
      registrationNumber: '',
      companyName: '',
      logo: null // Base64 for now
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4a159]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
            Configuración
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Personaliza tu perfil profesional y preferencias operativas</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`
            flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all
            ${success 
              ? 'bg-green-500 text-white' 
              : 'bg-[#c4a159] hover:bg-[#b89350] text-white shadow-xl shadow-gold-accent/20'}
            ${saving ? 'opacity-70 cursor-wait' : ''}
          `}
        >
          {success ? <CheckCircle2 size={22} /> : saving ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <Save size={22} />}
          {success ? 'GUARDADO' : saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar Mini */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Mi Cuenta</h3>
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
              <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 truncate">{user.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all mt-4"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Apariencia</h3>
            <button 
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl transition-all hover:bg-slate-100"
            >
              <div className="flex items-center gap-3 font-bold text-slate-700">
                {darkMode ? <Moon size={20} className="text-indigo-500" /> : <Sun size={20} className="text-amber-500" />}
                Modo {darkMode ? 'Oscuro' : 'Claro'}
              </div>
              <div className={`w-12 h-6 rounded-full transition-all relative ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Perfil Profesional */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#c4a159]/10 rounded-2xl flex items-center justify-center text-[#c4a159]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Perfil Profesional</h3>
                <p className="text-sm text-slate-500 font-medium">Información oficial para los dictámenes legales</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Firma del Despachante</label>
                <input 
                  type="text" 
                  value={formData.professionalProfile.signatureName}
                  onChange={e => setFormData({
                    ...formData, 
                    professionalProfile: { ...formData.professionalProfile, signatureName: e.target.value }
                  })}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#c4a159] focus:ring-4 focus:ring-[#c4a159]/5 font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº Registro / Matrícula</label>
                <input 
                  type="text" 
                  value={formData.professionalProfile.registrationNumber}
                  onChange={e => setFormData({
                    ...formData, 
                    professionalProfile: { ...formData.professionalProfile, registrationNumber: e.target.value }
                  })}
                  placeholder="Ej: 12345/AD"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#c4a159] focus:ring-4 focus:ring-[#c4a159]/5 font-bold transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estudio / Empresa</label>
                <input 
                  type="text" 
                  value={formData.professionalProfile.companyName}
                  onChange={e => setFormData({
                    ...formData, 
                    professionalProfile: { ...formData.professionalProfile, companyName: e.target.value }
                  })}
                  placeholder="Nombre de tu estudio de comercio exterior"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#c4a159] focus:ring-4 focus:ring-[#c4a159]/5 font-bold transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo del Estudio</label>
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-[#c4a159] transition-all group">
                  <div className="relative w-24 h-24 bg-white rounded-2xl shadow-inner flex items-center justify-center overflow-hidden border border-slate-100">
                    {formData.professionalProfile.logo ? (
                      <img src={formData.professionalProfile.logo} alt="Logo preview" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 size={32} className="text-slate-200" />
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white">
                      <Camera size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-700">Imagen de marca</p>
                    <p className="text-xs text-slate-500 mt-1">Recomendado: PNG fondo transparente, máx 200KB.</p>
                    {formData.professionalProfile.logo && (
                      <button 
                        onClick={() => setFormData({...formData, professionalProfile: {...formData.professionalProfile, logo: null}})}
                        className="text-xs text-red-500 font-bold mt-2"
                      >
                        Eliminar logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Preferencias Operativas */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#c4a159]/10 rounded-2xl flex items-center justify-center text-[#c4a159]">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Operativa por Defecto</h3>
                <p className="text-sm text-slate-500 font-medium">Agiliza la creación de nuevas valoraciones</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Moneda Principal</label>
                <select 
                  value={formData.defaults.currency}
                  onChange={e => setFormData({
                    ...formData, 
                    defaults: { ...formData.defaults, currency: e.target.value }
                  })}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#c4a159] font-bold transition-all bg-white"
                >
                  <option value="DOL">Dólares (USD)</option>
                  <option value="EUR">Euros (EUR)</option>
                  <option value="PES">Pesos Arg (ARS)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Incoterm Habitual</label>
                <select 
                  value={formData.defaults.incoterm}
                  onChange={e => setFormData({
                    ...formData, 
                    defaults: { ...formData.defaults, incoterm: e.target.value }
                  })}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#c4a159] font-bold transition-all bg-white"
                >
                  <option value="FOB">FOB (Puerto Carga)</option>
                  <option value="FCA">FCA (Lugar Entrega)</option>
                  <option value="EXW">EXW (En Fábrica)</option>
                  <option value="CIF">CIF (Costo, Seg y Flete)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aduana de Jurisdicción</label>
                <input 
                  type="text" 
                  value={formData.defaults.habitualCustoms}
                  onChange={e => setFormData({
                    ...formData, 
                    defaults: { ...formData.defaults, habitualCustoms: e.target.value }
                  })}
                  placeholder="Ej: BUENOS AIRES (001)"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#c4a159] font-bold transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Punto de Carga / Frontera</label>
                <input 
                  type="text" 
                  value={formData.defaults.loadingPoint}
                  onChange={e => setFormData({
                    ...formData, 
                    defaults: { ...formData.defaults, loadingPoint: e.target.value }
                  })}
                  placeholder="Ej: Paso de los Libres"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-[#c4a159] font-bold transition-all"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
