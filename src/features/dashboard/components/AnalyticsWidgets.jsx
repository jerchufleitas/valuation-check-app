import { TrendingUp, DollarSign, Activity, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";

export function AnalyticsWidgets({ valuations = [], loading }) {
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    // Tasas de conversión fijas (Basadas en USD como base)
    const conversionRates = {
      'DOL': 1.0,
      '060': 1.08, // EURO
      '012': 0.18, // REAL
      '021': 1.27, // LIBRA
      'PES': 0.001, // PESO ARG (Estimado para dashboard)
      '011': 0.025, // PESO URU
      '009': 1.15,  // FRANCO SUIZO
      '061': 0.14,  // YUAN
    };

    const parseValue = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      const str = String(val);
      if (str.includes('.') && str.includes(',')) {
        return parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
      }
      if (str.includes(',') && !str.includes('.')) {
        return parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
      }
      return parseFloat(str.replace(/[^\d.]/g, '')) || 0;
    };

    const getUsdValue = (v) => {
      const value = v.valoracion?.totales?.fob || v.item?.totalValue || v.precioBase || v.totalValue || 0;
      const currency = v.transaction?.currency || 'DOL';
      const num = parseValue(value);
      const rate = conversionRates[currency] || 1.0;
      return num * rate;
    };

    const parseDate = (v) => {
      const val = v.updatedAt || v.createdAt || (v.serverUpdatedAt?.toDate ? v.serverUpdatedAt.toDate() : null);
      if (!val) return new Date(0);
      const d = new Date(val);
      return isNaN(d.getTime()) ? new Date(0) : d;
    };

    const recentDocs = valuations.filter(v => {
      const d = parseDate(v);
      return d >= thirtyDaysAgo;
    });

    const previousDocs = valuations.filter(v => {
      const d = parseDate(v);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });

    // Detectar si hay múltiples divisas en el periodo reciente
    const uniqueCurrencies = [...new Set(recentDocs.map(v => v.transaction?.currency || 'DOL'))];
    const isMultiCurrency = uniqueCurrencies.length > 1;

    // 1. Operaciones (Móvil 30d)
    const countRecent = recentDocs.length;
    const countPrevious = previousDocs.length;
    let countChange = "0%";
    if (countPrevious > 0) {
      countChange = `${Math.round(((countRecent - countPrevious) / countPrevious) * 100)}%`;
    } else if (countRecent > 0) {
      countChange = "+100%";
    }

    // 2. Capital Total Procesado (Normalizado a USD)
    const totalRecent = recentDocs.reduce((acc, curr) => acc + getUsdValue(curr), 0);
    const totalPrevious = previousDocs.reduce((acc, curr) => acc + getUsdValue(curr), 0);

    let totalChange = "0%";
    if (totalPrevious > 0) {
      totalChange = `${Math.round(((totalRecent - totalPrevious) / totalPrevious) * 100)}%`;
    } else if (totalRecent > 0) {
      totalChange = "+100%";
    }

    const formatCurrency = (val) => {
      if (val >= 1000000) return `USD ${(val / 1000000).toFixed(2)}M`;
      if (val >= 1000) return `USD ${(val / 1000).toFixed(1)}K`;
      return `USD ${val.toFixed(0)}`;
    };

    // 3. Tasa de Precisión (Histórica)
    const finalizedCount = valuations.filter(v => v.status === 'FINALIZADO').length;
    const efficiency = valuations.length > 0 
      ? Math.round((finalizedCount / valuations.length) * 100) 
      : 0;
    
    return [
      {
        title: "OPERACIONES (30 DÍAS)",
        value: countRecent.toString(),
        change: countChange.startsWith('-') ? countChange : (countChange === '0%' ? '0%' : `+${countChange}`),
        icon: TrendingUp,
        color: "#c4a159",
      },
      {
        title: "CAPITAL PROCESADO",
        value: formatCurrency(totalRecent),
        change: isMultiCurrency ? "+Multidivisa" : (totalChange.startsWith('-') ? totalChange : (totalChange === '0%' ? '0%' : `+${totalChange}`)),
        icon: DollarSign,
        color: "#3b82f6",
      },
      {
        title: "PRECISIÓN TÉCNICA",
        value: `${efficiency}%`,
        change: efficiency > 80 ? "ALTA" : (efficiency > 50 ? "MEDIA" : "MEJORABLE"),
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
