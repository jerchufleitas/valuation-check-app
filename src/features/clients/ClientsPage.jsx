import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  FileText, 
  MapPin, 
  Info, 
  Phone, 
  ChevronRight, 
  Loader2,
  Trash2,
  ExternalLink,
  Briefcase,
  Settings
} from 'lucide-react';
import { getClients, saveClient, deleteClient } from '../../firebase/clientService';
import { getValuations } from '../../firebase/valuationService';

export default function ClientsPage({ user, onSelectValuation, onNewValuationForClient }) {
  const [clients, setClients] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    razonSocial: '',
    cuit: '',
    direccion: '',
    contacto: '',
    configDefault: {
      currency: 'DOL',
      incoterm: 'FOB'
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const [clientsData, valuationsData] = await Promise.all([
          getClients(user.uid),
          getValuations(user.uid)
        ]);
        setClients(clientsData);
        setValuations(valuationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.uid]);

  const handleSaveClient = async (e) => {
    e.preventDefault();
    try {
      await saveClient(formData, user.uid);
      const updatedClients = await getClients(user.uid);
      setClients(updatedClients);
      setShowModal(false);
      setFormData({
        razonSocial: '', cuit: '', direccion: '', contacto: '',
        configDefault: { currency: 'DOL', incoterm: 'FOB' }
      });
    } catch (error) {
      alert("Error al guardar cliente");
    }
  };

  const filteredClients = clients.filter(c => 
    c.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cuit.includes(searchTerm)
  );

  const getClientValuations = (clientId) => {
    // Currently we link by client name in metadata.cliente, 
    // but we should transition to Link by ID. 
    // For now, let's filter by name or ID if available.
    return valuations.filter(v => 
      v.clientId === clientId || 
      v.metadata?.cliente === clients.find(c => c.id === clientId)?.razonSocial
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-4">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-bold uppercase tracking-widest text-sm">Cargando directorio de clientes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Users className="text-[#c4a159]" size={32} />
            Directorio de Clientes
          </h2>
          <p className="text-slate-500 font-medium mt-1">Gestión centralizada de perfiles y dictámenes</p>
        </div>
        <button 
          onClick={() => {
            setSelectedClient(null);
            setFormData({ razonSocial: '', cuit: '', direccion: '', contacto: '', configDefault: { currency: 'DOL', incoterm: 'FOB' } });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#c4a159] hover:bg-[#b89350] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-gold-accent/20"
        >
          <Plus size={20} />
          NUEVO PERFIL
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por Razón Social o CUIT..."
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-[#c4a159] focus:ring-4 focus:ring-[#c4a159]/10 outline-none transition-all font-medium text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Clientes</span>
          <span className="text-2xl font-black text-slate-900">{clients.length}</span>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClients.map((client) => {
          const clientVals = getClientValuations(client.id);
          return (
            <motion.div 
              layout
              key={client.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all overflow-hidden flex flex-col group"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#c4a159]/10 flex items-center justify-center text-[#c4a159]">
                    <Briefcase size={24} />
                  </div>
                  <div className="status-badge borrador" style={{ fontSize: '10px' }}>
                    #{client.cuit}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 truncate mb-1">{client.razonSocial}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-tight">
                  <MapPin size={12} />
                  <span className="truncate">{client.direccion || 'Sin dirección'}</span>
                </div>
              </div>

              {/* Card Body - Subview Valuations */}
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dictámenes Vinculados</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">{clientVals.length}</span>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {clientVals.length > 0 ? clientVals.slice(0, 3).map(val => (
                    <div 
                      key={val.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-[#c4a159]/5 border border-transparent hover:border-[#c4a159]/10 transition-all cursor-pointer group/item"
                      onClick={() => onSelectValuation(val)}
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 font-mono">#{val.id.substring(0,6)}</span>
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{val.metadata?.referencia || 'Sin Ref'}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover/item:text-[#c4a159] transform transition-transform group-hover/item:translate-x-1" />
                    </div>
                  )) : (
                    <p className="text-center py-4 text-xs font-bold text-slate-300 italic">No hay historial para este cliente</p>
                  )}
                  {clientVals.length > 3 && (
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider py-1">+ {clientVals.length - 3} más...</p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                 <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedClient(client);
                        setFormData(client);
                        setShowModal(true);
                      }}
                      className="p-2 text-slate-400 hover:text-[#c4a159] hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                      <Info size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if(window.confirm(`¿Seguro que quieres eliminar a ${client.razonSocial}?`)) {
                          deleteClient(client.id).then(() => getClients(user.uid).then(setClients));
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
                  <button 
                    onClick={() => onNewValuationForClient(client)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#c4a159]/10 border border-[#c4a159]/20 rounded-lg text-xs font-bold text-[#c4a159] hover:bg-[#c4a159] hover:text-white transition-all shadow-sm"
                  >
                    NUEVA VALORACIÓN
                    <Plus size={12} />
                  </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-100 flex-shrink-0">
                <h3 className="text-2xl font-black text-slate-900">
                  {selectedClient ? 'Editar Perfil' : 'Nuevo Cliente'}
                </h3>
                <p className="text-slate-500 text-sm font-medium">Completa los datos fiscales para agilizar futuras declaraciones.</p>
              </div>

              <form onSubmit={handleSaveClient} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Razón Social</label>
                    <input 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#c4a159] transition-all font-bold text-slate-900" 
                      value={formData.razonSocial}
                      onChange={e => setFormData({...formData, razonSocial: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-400">CUIT / Tax ID</label>
                      <input 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#c4a159] transition-all font-bold text-slate-900" 
                        value={formData.cuit}
                        onChange={e => setFormData({...formData, cuit: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-400">Contacto</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#c4a159] transition-all font-bold text-slate-900" 
                        value={formData.contacto}
                        onChange={e => setFormData({...formData, contacto: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Dirección Legal</label>
                    <input 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#c4a159] transition-all font-bold text-slate-900" 
                      value={formData.direccion}
                      onChange={e => setFormData({...formData, direccion: e.target.value})}
                    />
                  </div>
                  
                  <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Settings size={12} /> Preferencias Habituales
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Moneda</label>
                        <select 
                          className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 outline-none text-xs font-bold"
                          value={formData.configDefault.currency}
                          onChange={e => setFormData({...formData, configDefault: {...formData.configDefault, currency: e.target.value}})}
                        >
                          <option value="DOL">Dólares (USD)</option>
                          <option value="EUR">Euros (EUR)</option>
                          <option value="PES">Pesos Arg (ARS)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Incoterm</label>
                        <select 
                          className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 outline-none text-xs font-bold"
                          value={formData.configDefault.incoterm}
                          onChange={e => setFormData({...formData, configDefault: {...formData.configDefault, incoterm: e.target.value}})}
                        >
                          <option value="FOB">FOB</option>
                          <option value="CIF">CIF</option>
                          <option value="EXW">EXW</option>
                          <option value="FCA">FCA</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-xl border border-slate-200 font-bold text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    CANCELAR
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-4 rounded-xl bg-[#c4a159] text-white font-black hover:bg-[#b89350] transition-all shadow-lg shadow-gold-accent/20"
                  >
                    {selectedClient ? 'GUARDAR CAMBIOS' : 'CREAR PERFIL'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
