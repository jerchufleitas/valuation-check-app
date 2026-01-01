import { TrendingUp, DollarSign, Activity, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { getCurrencyLabel, parseRecordDate } from "../../../utils/formatters";

export function AnalyticsWidgets({ valuations = [], loading }) {
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

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

    const recentDocs = valuations.filter(v => {
      const d = parseRecordDate(v);
      return d >= thirtyDaysAgo;
    });

    // 1. Operaciones (Móvil 30d)
    const countRecent = recentDocs.length;

    // 2. Capital por Divisa (Sin mezclar)
    const totalsByCurrency = recentDocs.reduce((acc, curr) => {
      const rawCode = curr.transaction?.currency || 'DOL';
      const label = getCurrencyLabel(rawCode);
      const val = curr.valoracion?.totales?.fob || curr.item?.totalValue || curr.precioBase || curr.totalValue || 0;
      acc[label] = (acc[label] || 0) + parseValue(val);
      return acc;
    }, {});

    const sortedLabels = Object.keys(totalsByCurrency).sort((a, b) => totalsByCurrency[b] - totalsByCurrency[a]);
    const mainLabel = sortedLabels[0] || 'USD';
    const otherLabels = sortedLabels.slice(1);

    const formatShort = (val, label) => {
      let formatted = val;
      if (val >= 1000000) formatted = `${(val / 1000000).toFixed(2)}M`;
      else if (val >= 1000) formatted = `${(val / 1000).toFixed(1)}K`;
      else formatted = val.toFixed(0);
      return `${label} ${formatted}`;
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
        change: countRecent > 0 ? "EN CURSO" : "SIN DATOS",
        icon: TrendingUp,
        color: "#c4a159",
      },
      {
        title: "CAPITAL PROCESADO",
        value: totalsByCurrency[mainLabel] ? formatShort(totalsByCurrency[mainLabel], mainLabel) : "USD 0",
        subValue: otherLabels.length > 0 ? `+ ${otherLabels.map(l => formatShort(totalsByCurrency[l], l)).join(', ')}` : null,
        change: otherLabels.length > 0 ? "FLEXIBLE" : "NOMINAL",
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
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter"
                  style={{
                    backgroundColor: `${card.color}10`,
                    color: card.color,
                  }}
                >
                  {card.change}
                </span>
              </div>

              <h3 className="text-2xl mb-1 text-slate-900 font-bold leading-tight">{card.value}</h3>
              {card.subValue && (
                <p className="text-[11px] font-semibold text-slate-400 mb-2 truncate" title={card.subValue}>
                  {card.subValue}
                </p>
              )}
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">{card.title}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
