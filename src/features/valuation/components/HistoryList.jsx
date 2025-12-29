import React, { useState, useEffect } from 'react';
import { getValuations } from '../../../firebase/valuationService';
import { Calendar, User, FileText, ChevronRight, Search, Loader2, Trash2 } from 'lucide-react';

const HistoryList = ({ user, onSelect }) => {
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getValuations(user.uid);
        setValuations(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.uid]);

  const filteredValuations = valuations.filter(v => {
    const searchStr = `${v.metadata?.cliente || ''} ${v.metadata?.referencia || ''} ${v.id || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="history-loading">
        <Loader2 className="animate-spin" size={40} />
        <p>Cargando tu historial...</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header-card">
        <div className="history-title-row">
          <h2>Mi Historial de Valoraciones</h2>
          <span className="badge-count">{filteredValuations.length} total</span>
        </div>
        
        <div className="history-search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por cliente, referencia o ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="history-grid">
        {filteredValuations.length === 0 ? (
          <div className="empty-history">
            <FileText size={48} opacity={0.3} />
            <p>No se encontraron valoraciones cargadas.</p>
          </div>
        ) : (
          filteredValuations.map((valuation) => (
            <div key={valuation.id} className="history-card" onClick={() => onSelect(valuation)}>
              <div className="history-card-header">
                <span className="valuation-id">ID: {valuation.id.substring(0, 8)}...</span>
                <span className="valuation-date">
                  <Calendar size={14} />
                  {new Date(valuation.updatedAt || valuation.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="history-card-body">
                <div className="client-info">
                  <User size={16} className="text-muted" />
                  <div className="info-text">
                    <label>CLIENTE</label>
                    <strong>{valuation.metadata?.cliente || 'Sin nombre'}</strong>
                  </div>
                </div>

                <div className="reference-info">
                  <FileText size={16} className="text-muted" />
                  <div className="info-text">
                    <label>REFERENCIA</label>
                    <strong>{valuation.metadata?.referencia || 'Sin referencia'}</strong>
                  </div>
                </div>
              </div>

              <div className="history-card-footer">
                <span className="price-tag">
                  {valuation.transaction?.currency || 'USD'} {valuation.valoracion?.precioBase?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
                <button className="btn-view-history">
                  VER REPORTE
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryList;
