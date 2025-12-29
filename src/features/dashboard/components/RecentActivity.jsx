import { FileText, Clock, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

const valuations = [
  {
    id: "VAL-2025-001",
    client: "Vinos del Sur S.A.",
    value: "USD 10.200",
    date: "Hace 2 horas",
    status: "Finalizado",
  },
  {
    id: "VAL-2025-002",
    client: "Global Imports LLC",
    value: "USD 84.500",
    date: "Hace 5 horas",
    status: "Borrador",
  },
  {
    id: "VAL-2025-003",
    client: "AgroExport SRL",
    value: "USD 215.000",
    date: "Ayer",
    status: "Pendiente",
  },
];

const statusColors = {
  Finalizado: { bg: "#05966915", text: "#059669", border: "#05966930" },
  Borrador: { bg: "#d9770615", text: "#d97706", border: "#d9770630" },
  Pendiente: { bg: "#3b82f615", text: "#3b82f6", border: "#3b82f630" },
};

export function RecentActivity({ setView }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="p-6 rounded-2xl border border-white/10 h-full"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl mb-1 text-white font-bold">Actividad Reciente</h3>
          <p className="text-sm text-white/60">Últimas 3 valoraciones procesadas</p>
        </div>
        <button 
          onClick={() => setView('history')}
          className="text-[#c4a159] text-sm font-bold hover:text-[#d4b26a] transition-colors flex items-center gap-1"
        >
          Ver todo <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {valuations.map((val, index) => (
          <motion.div
            key={val.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
            className="p-4 rounded-xl border border-white/5 hover:border-[#c4a159]/30 hover:bg-white/5 transition-all duration-200 group cursor-pointer"
            onClick={() => setView('history')}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#c4a159]/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[#c4a159]" />
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-white font-bold">{val.id}</p>
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase"
                    style={{
                      backgroundColor: statusColors[val.status].bg,
                      color: statusColors[val.status].text,
                      borderColor: statusColors[val.status].border,
                    }}
                  >
                    {val.status}
                  </span>
                </div>
                <p className="text-sm text-white/60 truncate">{val.client}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm mb-1 text-white font-bold">{val.value}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-white/40">
                  <Clock className="w-3 h-3" />
                  <span>{val.date}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
