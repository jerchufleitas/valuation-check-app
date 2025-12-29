import { Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function WelcomeSection({ user, onNewValuation }) {
  const firstName = user?.displayName?.split(' ')[0] || 'Jerchu';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="p-8 rounded-2xl border border-white bg-white shadow-xl shadow-slate-200/50 relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c4a159]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-4xl mb-1 text-[#0d1b2a] font-bold">Hola, {firstName}</h2>
          <p className="text-slate-500 text-lg">¿Listo para procesar sus valoraciones aduaneras de hoy?</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewValuation}
          className="px-8 py-4 bg-gradient-to-r from-[#c4a159] to-[#b89350] text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-[#c4a159]/20 hover:shadow-[#c4a159]/40 transition-all duration-300 font-extrabold text-lg"
        >
          <Plus className="w-6 h-6" />
          <span>Nueva Valoración</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
