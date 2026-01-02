import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Cloud, FileText, ArrowRight, Zap, FileSearch, Upload, ChevronLeft, ChevronRight, X, Mail, Lock, Loader2 } from "lucide-react";
import { loginWithEmail, registerWithEmail } from '../../firebase/authService';

const LandingPage = ({ onLogin }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { src: "/assets/step1.png", title: "Carga de Datos", desc: "Interfaz intuitiva para identificar exportadores, importadores y logística." },
    { src: "/assets/step2.png", title: "Ajustes de Valoración", desc: "Control total sobre adiciones y deducciones según normas GATT." },
    { src: "/assets/step3.png", title: "Cálculos en Tiempo Real", desc: "Resultados automáticos del Valor Imponible con precisión profesional." },
    { src: "/assets/step4.png", title: "Historial Seguro", desc: "Acceso instantáneo a todas sus valoraciones guardadas en la nube." },
    { src: "/assets/step5.png", title: "Dictamen Final", desc: "Seleccione el formato de reporte profesional: Planilla, Comercial o Legal." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const fadeIn = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      // Success is handled by App.jsx listener
    } catch (err) {
      console.error(err);
      let msg = 'Error desconocido.';
      if (err.code === 'auth/email-already-in-use') msg = 'El correo ya está registrado.';
      if (err.code === 'auth/wrong-password') msg = 'Contraseña incorrecta.';
      if (err.code === 'auth/user-not-found') msg = 'Usuario no encontrado.';
      if (err.code === 'auth/weak-password') msg = 'La contraseña es muy débil (min 6 caracteres).';
      if (err.code === 'auth/invalid-email') msg = 'El correo no es válido.';
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-['Inter',sans-serif] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#0f172a]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto text-center z-10">
          <motion.h1
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl mb-6 tracking-tight font-bold leading-[1.1] text-white"
          >
            Elimine errores de valoración
            <br />
            <span className="bg-gradient-to-r from-[#c5a059] via-[#d4af6a] to-[#c5a059] bg-clip-text text-transparent">
              y multas aduaneras
            </span>{" "}
            en segundos
          </motion.h1>

          <motion.p
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#cbd5e1] mb-12 max-w-3xl mx-auto font-normal leading-relaxed"
          >
            La primera herramienta de Gestión de Valoración Aduanera diseñada para el ecosistema Comex en Argentina. ¡Genere dictámenes técnicos en segundos!
          </motion.p>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button 
              onClick={() => setShowAuthModal(true)}
              className="group relative px-10 py-5 bg-gradient-to-r from-[#c5a059] to-[#d4af6a] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(197,160,89,0.3)] hover:shadow-[0_20px_60px_rgba(197,160,89,0.5)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-3 text-[#0f172a] font-bold text-lg">
                Empiece ahora
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-10 py-5 rounded-2xl border border-[#cbd5e1]/20 bg-[#1e293b]/50 backdrop-blur-md hover:bg-[#1e293b]/80 transition-all duration-300 font-bold text-lg"
            >
              Ver demo
            </button>
          </motion.div>

          {/* Trust Bar */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 pt-12 border-t border-[#cbd5e1]/10"
          >
            <p className="text-sm text-[#64748b] mb-6 uppercase tracking-wider">Confiado por profesionales del comercio exterior</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#c5a059]" />
                <span className="text-sm">Seguridad Encriptada</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="w-6 h-6 text-[#c5a059]" />
                <span className="text-sm">Cloud Certificado</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#c5a059]" />
                <span className="text-sm">Compliance RG 2010/2006</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-6 font-bold">
              Ahorre dinero en multas, gestione y resguarde sus{" "}
              <span className="text-[#c5a059]">Valoraciones Aduaneras</span> de forma permanente.
            </h2>
            <p className="text-xl text-[#cbd5e1] max-w-3xl mx-auto">
              Herramienta Profesional diseñada específicamente para Despachantes de Aduana, Importadores y Exportadores
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "RG 2010/2006 Compliance",
                description: "Formulario oficial automatizado con validación en tiempo real. Asegure el cumplimiento total de la normativa aduanera argentina.",
                gradient: "from-[#c5a059]/10 to-transparent"
              },
              {
                icon: FileSearch,
                title: "Análisis Técnico Personalizado",
                description: "Todos los detalles que desee serán tenidos en cuenta como Análisis Técnico antes de generar una Valoración",
                gradient: "from-blue-500/10 to-transparent"
              },
              {
                icon: Cloud,
                title: "Nube Privada Segura",
                description: "Historial centralizado y encriptado de todos sus clientes. Acceda desde cualquier lugar con seguridad de nivel bancario.",
                gradient: "from-purple-500/10 to-transparent"
              },
              {
                icon: FileText,
                title: "Dictámenes PDF Profesionales",
                description: "Reportes técnicos con formato legal listos para presentar ante ARCA. Incluye todos los cálculos y justificaciones requeridas.",
                gradient: "from-emerald-500/10 to-transparent"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative p-8 rounded-3xl border border-[#cbd5e1]/10 bg-gradient-to-br from-[#1e293b]/50 to-[#0f172a]/50 backdrop-blur-sm hover:border-[#c5a059]/30 transition-all duration-300"
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c5a059]/20 to-[#c5a059]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-[#c5a059]" />
                  </div>
                  
                  <h3 className="text-2xl mb-4 font-semibold">
                    {feature.title}
                  </h3>
                  
                  <p className="text-[#cbd5e1] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Preview Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-6 font-bold">
              Vea cómo funciona en la <span className="text-[#c5a059]">práctica</span>
            </h2>
            <p className="text-xl text-[#cbd5e1]">
              Análisis técnico personalizado y reportes profesionales listos para usar
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group max-w-5xl mx-auto"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#c5a059]/30 to-[#d4af6a]/30 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="relative rounded-3xl overflow-hidden border border-[#cbd5e1]/10 bg-[#0f172a] shadow-2xl">
              <div className="relative aspect-[16/10] md:aspect-[16/8]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentStep}
                    src={steps[currentStep].src}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-contain p-4 md:p-8"
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button 
                  onClick={() => setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-[#c5a059] transition-colors z-20"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setCurrentStep((prev) => (prev + 1) % steps.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-[#c5a059] transition-colors z-20"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Step info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-[#c5a059] font-bold text-xl mb-1">{steps[currentStep].title}</h3>
                    <p className="text-white/80 text-sm max-w-md">{steps[currentStep].desc}</p>
                  </div>
                  <div className="flex gap-2">
                    {steps.map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setCurrentStep(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentStep ? 'bg-[#c5a059] w-6' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works - Timeline */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-[#1e293b] to-[#1e293b]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl mb-6 font-bold">
              Tres pasos hacia el <span className="text-[#c5a059]">Compliance Total</span>
            </h2>
            <p className="text-xl text-[#cbd5e1]">
              Desde el inicio de sesión hasta su dictamen técnico en minutos
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                icon: Zap,
                title: "Inicie sesión con Google",
                description: "Acceso instantáneo y seguro. Sin formularios complejos, sin configuraciones. Un clic y está dentro."
              },
              {
                step: "02",
                icon: Upload,
                title: "Cargue los datos de Valoración de manera rápida e intuitiva",
                description: "Ingrese la información que desea registrar en su Valoración"
              },
              {
                step: "03",
                icon: FileText,
                title: "Obtenga su Valor Imponible",
                description: "Cálculo preciso según el GATT Art. 1 & 8. Gestione su Dictamen para presentación ante Clientes/Aduana, guardando su historial de manera segura y 100% privada."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#d4af6a] flex items-center justify-center shadow-[0_10px_30px_rgba(197,160,89,0.4)]">
                    <item.icon className="w-8 h-8 text-[#0f172a]" />
                  </div>

                  <div className="flex-1 pt-1">
                    <span className="inline-block px-3 py-1 mb-4 rounded-full bg-[#c5a059]/10 text-[#c5a059] text-sm font-semibold">
                      Paso {item.step}
                    </span>
                    <h3 className="text-2xl mb-3 font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-[#cbd5e1] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {index < 2 && (
                  <div className="absolute left-8 top-20 w-1 h-12 bg-gradient-to-b from-[#c5a059] to-transparent opacity-30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl mb-6 font-bold">
              Precio simple y <span className="text-[#c5a059]">transparente</span>
            </h2>
            <p className="text-xl text-[#cbd5e1]">
              Sin sorpresas. Sin límites escondidos.
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#c5a059] to-[#d4af6a] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            
            <div className="relative p-12 rounded-3xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#c5a059]/20">
              <div className="absolute top-0 right-12 -translate-y-1/2">
                <span className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-[#c5a059] to-[#d4af6a] text-[#0f172a] text-sm font-bold">
                  MÁS POPULAR
                </span>
              </div>

              <h3 className="text-3xl mb-2 font-semibold">
                Plan Profesional
              </h3>
              <p className="text-[#cbd5e1] mb-8">
                Para despachantes y empresas de comercio exterior
              </p>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-6xl text-[#c5a059] font-bold">
                  USD 15
                </span>
                <span className="text-2xl text-[#64748b]">/mes</span>
              </div>

              <ul className="space-y-4 mb-10">
                {[
                  "Valoraciones ilimitadas",
                  "Dictámenes PDF exportables",
                  "Historial completo en la nube",
                  "Soporte prioritario 24/7",
                  "Actualizaciones automáticas",
                  "Seguridad de nivel bancario"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#c5a059] flex-shrink-0" />
                    <span className="text-[#cbd5e1]">{item}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => setShowAuthModal(true)}
                className="w-full group/btn relative px-8 py-5 bg-gradient-to-r from-[#c5a059] to-[#d4af6a] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(197,160,89,0.3)] hover:shadow-[0_20px_60px_rgba(197,160,89,0.5)] transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2 text-[#0f172a] font-bold">
                  Comenzar prueba gratuita
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </button>

              <p className="text-center text-sm text-[#64748b] mt-6">
                Cancele cuando quiera
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-[#cbd5e1]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-2xl mb-4 font-bold">
                Valuation<span className="text-[#c5a059]">Check</span>
              </h3>
              <p className="text-[#64748b] mb-6">
                La herramienta de Validación Aduanera más avanzada de Argentina. Diseñada por y para Profesionales en Comercio Exterior
              </p>
              <div className="flex items-center gap-2 text-sm text-[#64748b]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#c5a059]" />
                Hecho en Argentina con precisión y seguridad
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Producto</h4>
              <ul className="space-y-3 text-[#64748b]">
                <li>Acceso Seguro</li>
                <li>Automatización</li>
                <li>Historial Nube</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-3 text-[#64748b]">
                <li>Términos Técnicos</li>
                <li>Privacidad de Datos</li>
                <li>Compliance GATT</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#cbd5e1]/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#64748b]">
              © 2026 ValuationCheck. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => { if(e.target === e.currentTarget) setShowAuthModal(false); }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0f172a] border border-[#c5a059]/20 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <button 
                onClick={() => setShowAuthModal(false)} 
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="relative">
                <h2 className="text-3xl font-bold mb-2 text-center text-white">
                  {authMode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
                </h2>
                <p className="text-slate-400 text-center mb-8 text-sm">
                  {authMode === 'login' ? 'Acceda a su gestión de valoraciones' : 'Comience a profesionalizar sus dictámenes'}
                </p>

                <form onSubmit={handleAuth} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Correo Profesional</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-[#c5a059] transition-colors" size={20} />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e=>setEmail(e.target.value)} 
                        required 
                        className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-slate-700 rounded-xl outline-none focus:border-[#c5a059] text-white placeholder-slate-600 transition-all shadow-inner"
                        placeholder="nombre@empresa.com" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contraseña</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-[#c5a059] transition-colors" size={20} />
                      <input 
                        type="password" 
                        value={password} 
                        onChange={e=>setPassword(e.target.value)} 
                        required 
                        minLength={6}
                        className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-slate-700 rounded-xl outline-none focus:border-[#c5a059] text-white placeholder-slate-600 transition-all shadow-inner"
                        placeholder="••••••••" 
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {authError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-400 text-sm font-medium bg-red-900/20 p-3 rounded-lg border border-red-500/20 text-center"
                      >
                        {authError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    disabled={authLoading}
                    className="w-full py-4 bg-gradient-to-r from-[#c5a059] to-[#d4af6a] rounded-xl text-[#0f172a] font-bold text-lg hover:shadow-[0_0_20px_rgba(197,160,89,0.4)] transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {authLoading && <Loader2 className="animate-spin" size={20} />}
                    {authMode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                  </button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                  <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider"><span className="bg-[#0f172a] px-3 text-slate-500">O continuar con</span></div>
                </div>

                <button 
                  onClick={() => { onLogin(); }} 
                  className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold transition-colors flex items-center justify-center gap-3 border border-slate-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.0-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>

                <div className="mt-6 text-center">
                   <p className="text-slate-400 text-sm">
                     {authMode === 'login' ? '¿No tiene cuenta aún?' : '¿Ya tiene cuenta?'} 
                     <button 
                       onClick={() => { setAuthMode(authMode==='login'?'register':'login'); setAuthError(''); setEmail(''); setPassword(''); }} 
                       className="text-[#c5a059] font-bold ml-2 hover:text-[#e0c485] hover:underline transition-colors"
                     >
                       {authMode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
                     </button>
                   </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
