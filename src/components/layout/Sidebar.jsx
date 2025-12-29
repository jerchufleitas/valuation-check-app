import React from 'react';
import { motion } from "motion/react";
import { Home, FilePlus, History, Users, Settings, LogOut, ShieldCheck } from "lucide-react";

const Sidebar = ({ activePage, setActivePage, user, onLogout }) => {
  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "form", label: "Nueva Valoración", icon: FilePlus },
    { id: "history", label: "Historial", icon: History },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "settings", label: "Ajustes", icon: Settings },
  ];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 h-screen flex flex-col bg-[#0d1b2a] border-r border-white/5 z-50 sticky top-0"
    >
      {/* Logo Section */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="text-[#c4a159]">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white leading-none">
              Valuation<span className="text-[#c4a159]">Check</span>
            </h1>
            <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-medium">
              Customs Valuation Tool
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`
                w-full flex items-center gap-4 px-6 py-4 rounded-xl
                transition-all duration-300 group relative
                ${isActive 
                  ? "bg-[#c4a159]/10 text-[#c4a159] border border-[#c4a159]/20" 
                  : "text-white/50 hover:text-white hover:bg-white/5"}
              `}
            >
              <Icon size={20} className={isActive ? "text-[#c4a159]" : "group-hover:text-white"} />
              <span className="font-bold text-sm">{item.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute left-0 w-1 h-6 bg-[#c4a159] rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Area */}
      <div className="p-6 border-t border-white/5 bg-black/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <img 
              src={user?.photoURL} 
              alt={user?.displayName} 
              className="w-12 h-12 rounded-full border-2 border-[#c4a159]/30 p-0.5"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0d1b2a] rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.displayName}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Despachante de Aduana</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-red-500/10 hover:text-red-400 border border-white/5 transition-all text-xs font-bold"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
