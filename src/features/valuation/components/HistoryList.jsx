import React, { useState, useEffect } from 'react';
import { getValuations } from '../../../firebase/valuationService';
import { Calendar, User, FileText, ChevronRight, Search, Loader2, LayoutGrid, List, SortAsc, SortDesc, Building2, Hash, FileDigit } from 'lucide-react';
import { getCurrencyLabel, parseRecordDate } from '../../../utils/formatters';

const HistoryList = ({ user, onSelect }) => {
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest) or 'asc' (oldest)

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

  const sortedValuations = [...valuations].sort((a, b) => {
    const dateA = parseRecordDate(a);
    const dateB = parseRecordDate(b);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const filteredValuations = sortedValuations.filter(v => {
    const searchTerms = [
      v.metadata?.cliente,
      v.metadata?.referencia,
      v.header?.exporterName,
      v.header?.importerName,
      v.item?.ncmCode,
      v.id
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchTerms.includes(searchTerm.toLowerCase().trim());
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
        
        <div className="history-controls">
          <div className="history-search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por cliente, referencia o ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="history-actions">
            <div className="view-toggles">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vista Cuadrícula"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vista Lista"
              >
                <List size={18} />
              </button>
            </div>

            <button 
              className="sort-toggle-btn"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              title={sortOrder === 'desc' ? "Ver más viejos primero" : "Ver más nuevos primero"}
            >
              {sortOrder === 'desc' ? <SortDesc size={18} /> : <SortAsc size={18} /> }
              <span>{sortOrder === 'desc' ? 'Más nuevos' : 'Más viejos'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`history-content ${viewMode}`}>
        {filteredValuations.length === 0 ? (
          <div className="empty-history">
            <FileText size={48} opacity={0.3} />
            <p>No se encontraron valoraciones cargadas.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="history-grid">
            {filteredValuations.map((valuation) => (
              <div key={valuation.id} className="history-card">
                <div className="history-card-header">
                  <div className="header-id-group flex items-center gap-2">
                    <span className={`status-badge ${(valuation.status || 'BORRADOR').toLowerCase()}`}>
                      <span className="status-dot"></span>
                      {valuation.status || 'BORRADOR'}
                    </span>
                    <span className="valuation-id id-gold-accent">#{valuation.id.substring(0, 6)}</span>
                  </div>
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
                      <strong className="crt-ref-text">{valuation.metadata?.referencia || 'Sin referencia'}</strong>
                    </div>
                  </div>
                </div>

                <div className="history-card-footer">
                  <span className="price-tag">
                    <span className="text-[10px] opacity-60 font-bold mr-1">{getCurrencyLabel(valuation.transaction?.currency)}</span>
                    {valuation.valoracion?.precioBase?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                  <button 
                    className="btn-view-history" 
                    onClick={() => onSelect(valuation)}
                  >
                    {(valuation.status || 'BORRADOR') === 'BORRADOR' ? 'CONTINUAR' : 'REPORTE'}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="history-list">
            <div className="history-list-header">
              <div className="col-id">ID / FECHA</div>
              <div className="col-client">CLIENTE</div>
              <div className="col-ref">REFERENCIA</div>
              <div className="col-price">MONTO</div>
              <div className="col-action">ACCION</div>
            </div>
              {filteredValuations.map((valuation) => (
                <div key={valuation.id} className="history-list-item">
                  <div className="col-id">
                    <div className="list-id-date-block">
                      <div className="flex items-center gap-2">
                        <span className={`status-badge ${(valuation.status || 'BORRADOR').toLowerCase()} scale-90 origin-left`}>
                          <span className="status-dot"></span>
                          {valuation.status || 'BORRADOR'}
                        </span>
                        <span className="list-id-subtle">#{valuation.id.substring(0, 6).toUpperCase()}</span>
                      </div>
                      <span className="list-date-stylized">{new Date(valuation.updatedAt || valuation.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="col-client">
                    <div className="list-info-with-icon">
                      <Building2 size={16} className="list-info-icon" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{valuation.metadata?.cliente || 'Sin nombre'}</span>
                    </div>
                  </div>
                  <div className="col-ref">
                    <div className="list-info-with-icon">
                      <FileDigit size={16} className="list-info-icon" />
                      <span className="text-muted font-medium italic">{valuation.metadata?.referencia || 'Sin ref.'}</span>
                    </div>
                  </div>
                  <div className="col-price">
                    <div className="list-monto-group">
                      <span className="list-currency-tag">{getCurrencyLabel(valuation.transaction?.currency)}</span>
                      <span className="list-amount-value">{valuation.valoracion?.precioBase?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="col-action">
                    <button 
                      className="btn-list-action"
                      onClick={() => onSelect(valuation)}
                    >
                      {(valuation.status || 'BORRADOR') === 'BORRADOR' ? 'CONTINUAR' : 'VER REPORTE'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryList;
