import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown, Package, Zap } from 'lucide-react';
import { ncmData } from '../data/ncmData';

const NCMTreeSelector = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const toggleNode = (id) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedNodes(newExpanded);
  };

  // Filtrado de búsqueda inteligente
  const filteredData = useMemo(() => {
    if (!searchTerm) return ncmData;

    const lowerSearch = searchTerm.toLowerCase();

    const filterNodes = (nodes) => {
      return nodes.reduce((acc, node) => {
        const matchesName = node.name.toLowerCase().includes(lowerSearch);
        const matchesCode = node.code.toLowerCase().includes(lowerSearch);
        const matchesKeywords = node.keywords?.some(k => k.toLowerCase().includes(lowerSearch));

        let filteredChildren = [];
        if (node.children) {
          filteredChildren = filterNodes(node.children);
        }

        if (matchesName || matchesCode || matchesKeywords || filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
          // Auto-expandir si hay coincidencia
          if (searchTerm) expandedNodes.add(node.id);
        }
        return acc;
      }, []);
    };

    return filterNodes(ncmData);
  }, [searchTerm]);

  const renderTree = (nodes, level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedNodes.has(node.id);
      const isLeaf = !node.children || node.children.length === 0;

      return (
        <div key={node.id} className="ncm-node-container">
          <div 
            className={`ncm-node level-${level} ${isLeaf ? 'leaf' : ''}`}
            onClick={() => isLeaf ? onSelect(node) : toggleNode(node.id)}
          >
            {!isLeaf && (
              <span className="ncm-icon">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            )}
            {isLeaf && <span className="ncm-icon"><Zap size={14} color="#c4a159" /></span>}
            
            <div className="ncm-content">
              <span className="ncm-code">{node.code}</span>
              <span className="ncm-name">{node.name}</span>
            </div>
          </div>
          
          {isExpanded && node.children && (
            <div className="ncm-children">
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="ncm-selector-overlay">
      <div className="ncm-selector-modal animate-in">
        <div className="ncm-header">
          <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
            <Package size={24} color="#c4a159" />
            <div>
              <h3>Búsqueda de Posición Arancelaria</h3>
              <p>Busca por palabra clave o explora el árbol NCM</p>
            </div>
          </div>
          <button className="close-modal" onClick={onClose}>&times;</button>
        </div>

        <div className="ncm-search-container">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Ej: drone, motores, 88.06..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="ncm-tree-container">
          {filteredData.length > 0 ? (
            renderTree(filteredData)
          ) : (
            <div className="ncm-no-results">
              <p>No se encontraron posiciones para "{searchTerm}"</p>
            </div>
          )}
        </div>

        <div className="ncm-footer">
          <small>Información actualizada al 20-12-2025 (Simulada)</small>
        </div>
      </div>
    </div>
  );
};

export default NCMTreeSelector;
