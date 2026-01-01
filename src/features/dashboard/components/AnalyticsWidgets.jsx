import { TrendingUp, DollarSign, Activity, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";

export function AnalyticsWidgets({ valuations = [], loading }) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const thisMonthDocs = valuations.filter(v => {
      const d = new Date(v.updatedAt || v.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthDocs = valuations.filter(v => {
      const d = new Date(v.updatedAt || v.createdAt);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    // 1. Valoraciones este mes
    const countThisMonth = thisMonthDocs.length;
    const countLastMonth = lastMonthDocs.length;
    const countChange = countLastMonth === 0 
      ? (countThisMonth > 0 ? "+100%" : "0%") 
      : `${Math.round(((countThisMonth - countLastMonth) / countLastMonth) * 100)}%`;

    // 2. Valor Total Procesado
    const totalThisMonth = thisMonthDocs.reduce((acc, curr) => {
      const val = curr.valoracion?.totales?.fob || curr.item?.totalValue || 0;
      const numericVal = typeof val === 'string' ? parseFloat(val.replace(/\./g, '').replace(',', '.')) : val;
      return acc + (isNaN(numericVal) ? 0 : numericVal);
    }, 0);

    const totalLastMonth = lastMonthDocs.reduce((acc, curr) => {
      const val = curr.valoracion?.totales?.fob || curr.item?.totalValue || 0;
      const numericVal = typeof val === 'string' ? parseFloat(val.replace(/\./g, '').replace(',', '.')) : val;
      return acc + (isNaN(numericVal) ? 0 : numericVal);
    }, 0);

    const totalChange = totalLastMonth === 0 
      ? (totalThisMonth > 0 ? "+100%" : "0%") 
      : `${Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)}%`;

    const formatCurrency = (val) => {
      if (val >= 1000000) return `USD ${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `USD ${(val / 1000).toFixed(0)}K`;
      return `USD ${val.toFixed(0)}`;
    };

    // 3. Tasa de Eficiencia (Finalizados vs Total)
    const finalizedCount = valuations.filter(v => v.status === 'FINALIZADO').length;
    const efficiency = valuations.length > 0 
      ? Math.round((finalizedCount / valuations.length) * 100) 
      : 0;
    
    // Simulación de cambio de eficiencia (puedes ajustarlo si tienes histórico)
    const efficiencyChange = efficiency > 0 ? "OPTIMIZADO" : "N/A";

    return [
      {
        title: "Valoraciones este mes",
        value: countThisMonth.toString(),
        change: countChange.startsWith('-') ? countChange : (countChange === '0%' ? '0%' : `+${countChange}`),
        icon: TrendingUp,
        color: "#c4a159",
      },
      {
        title: "Valor Total Procesado",
        value: formatCurrency(totalThisMonth),
        change: totalChange.startsWith('-') ? totalChange : (totalChange === '0%' ? '0%' : `+${totalChange}`),
        icon: DollarSign,
        color: "#3b82f6",
      },
      {
        title: "Tasa de Eficiencia",
        value: `${efficiency}%`,
        change: efficiencyChange,
        icon: Activity,
        color: "#059669",
      },
    ];
  }, [valuations]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-lg flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-slate-300" size={32} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {stats.map((card, index) => {
        const Icon = card.icon;
        const isNeutral = card.change === "0%" || card.change === "OPTIMIZADO" || card.change === "N/A";
        const isNegative = card.change.startsWith("-");

        return (
          <motion.div
            key={card.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            className="p-6 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 relative overflow-hidden group hover:border-[#c4a159]/30 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#c4a159]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}10` }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-lg"
                  style={{
                    backgroundColor: isNegative ? 'rgba(239, 68, 68, 0.1)' : `${card.color}10`,
                    color: isNegative ? '#ef4444' : (isNeutral ? card.color : card.color),
                  }}
                >
                  {card.change}
                </span>
              </div>

              <h3 className="text-3xl mb-1 text-slate-900 font-bold">{card.value}</h3>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{card.title}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
