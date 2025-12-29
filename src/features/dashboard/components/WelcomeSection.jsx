import { Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function WelcomeSection({ user, onNewValuation }) {
  const firstName = user?.displayName?.split(' ')[0] || 'Jerchu';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="p-8 rounded-2xl border border-white/10 relative overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c4a159]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#c4a159]" />
            <p className="text-sm text-white/60">Servicio de Valoración Seguro</p>
          </div>
          <h2 className="text-3xl mb-1 text-white">Hola, {firstName}</h2>
          <p className="text-white/60">¿Listo para procesar sus valoraciones aduaneras de hoy?</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewValuation}
          className="px-6 py-3 bg-gradient-to-r from-[#c4a159] to-[#b89350] text-[#0d1b2a] rounded-xl flex items-center gap-2 shadow-lg shadow-[#c4a159]/20 hover:shadow-[#c4a159]/30 transition-all duration-200 font-bold"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Valoración</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
