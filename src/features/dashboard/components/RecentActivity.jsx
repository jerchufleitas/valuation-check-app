import { FileText, ChevronRight, Clock } from "lucide-react";
import { motion } from "motion/react";

const activities = [
  {
    id: "VAL-2025-001",
    client: "Vinos del Sur S.A.",
    value: "USD 10.200",
    date: "Hace 2 horas",
    status: "FINALIZADO",
    statusColor: "#059669",
  },
  {
    id: "VAL-2025-002",
    client: "Global Imports LLC",
    value: "USD 45.300",
    date: "Hace 5 horas",
    status: "EN REVISIÓN",
    statusColor: "#c4a159",
  },
  {
    id: "VAL-2025-003",
    client: "Logística Alpha",
    value: "USD 8.900",
    date: "Ayer",
    status: "FINALIZADO",
    statusColor: "#059669",
  },
];

export function RecentActivity({ setView }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Actividad Reciente</h3>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Últimas 3 valoraciones procesadas</p>
        </div>
        <button 
          onClick={() => setView('history')}
          className="text-[#c4a159] hover:text-[#b89350] transition-colors flex items-center gap-1 font-bold text-sm"
        >
          Ver todo <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center justify-between p-5 rounded-xl border border-slate-50 hover:border-[#c4a159]/20 hover:bg-slate-50/50 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#c4a159] transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">{item.id}</span>
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${item.statusColor}10`, color: item.statusColor }}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-slate-900 font-bold">{item.client}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">{item.value}</p>
              <div className="flex items-center justify-end gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                {item.date}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
