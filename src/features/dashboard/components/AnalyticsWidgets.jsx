import { TrendingUp, DollarSign, Activity } from "lucide-react";
import { motion } from "motion/react";

const cards = [
  {
    title: "Valoraciones este mes",
    value: "12",
    change: "+10%",
    icon: TrendingUp,
    color: "#c4a159",
  },
  {
    title: "Valor Total Procesado",
    value: "USD 245K",
    change: "+15%",
    icon: DollarSign,
    color: "#3b82f6",
  },
  {
    title: "Tasa de Eficiencia",
    value: "98%",
    change: "+2%",
    icon: Activity,
    color: "#059669",
  },
];

export function AnalyticsWidgets() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            className="p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-[#c4a159]/30 transition-all duration-300"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <span
                  className="text-xs font-bold px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: `${card.color}15`,
                    color: card.color,
                  }}
                >
                  {card.change}
                </span>
              </div>

              <h3 className="text-3xl mb-1 text-white font-bold">{card.value}</h3>
              <p className="text-sm text-white/60 font-medium">{card.title}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
