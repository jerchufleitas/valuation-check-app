import { FileText, ChevronRight, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getValuations } from "../../../firebase/valuationService";
import { motion } from "motion/react";

export function RecentActivity({ setView, user, onSelect, initialData, loading: parentLoading }) {
  const [activities, setActivities] = useState(initialData || []);
  const [loading, setLoading] = useState(initialData ? false : true);

  useEffect(() => {
    if (initialData) {
      setActivities(initialData);
      setLoading(parentLoading !== undefined ? parentLoading : false);
      return;
    }

    const fetchRecent = async () => {
      if (!user?.uid) return;
      try {
        const data = await getValuations(user.uid);
        // Solo tomamos los últimos 3 para el dashboard
        setActivities(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, [user?.uid, initialData, parentLoading]);

  const getTimeAgo = (date) => {
    if (!date) return 'Desconocido';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `Hace ${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `Hace ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `Hace ${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `Hace ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `Hace ${Math.floor(interval)} min`;
    return 'Hace instantes';
  };

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
        {loading ? (
          <div className="flex flex-col items-center py-8 text-slate-400 gap-2">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-bold">Cargando actividad...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm font-bold">No hay actividad reciente.</p>
          </div>
        ) : (
          activities.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="recent-activity-card"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#c4a159] transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold id-gold-accent">#{item.id.substring(0, 6)}</span>
                    <span className={`status-badge ${(item.status || 'BORRADOR').toLowerCase()}`}>
                       {item.status || 'BORRADOR'}
                    </span>
                  </div>
                  <p className="text-slate-900 font-bold">{item.metadata?.cliente || 'Sin Cliente'}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">
                    {item.transaction?.currency || 'USD'} {item.valoracion?.precioBase?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    {getTimeAgo(item.updatedAt || item.createdAt)}
                  </div>
                </div>
                <button 
                  onClick={() => onSelect(item)}
                  className="btn-list-action"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.65rem' }}
                >
                  {(item.status || 'BORRADOR') === 'BORRADOR' ? 'CONTINUAR' : 'REPORTE'}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
