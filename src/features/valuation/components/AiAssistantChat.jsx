import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, Loader2, X, MessageSquare, Sparkles, FileText } from 'lucide-react';
import { startAiChat, sendChatMessage, normalizeValue } from '../../../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

const AiAssistantChat = ({ onDataExtracted }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy tu asistente de valoración. Podés subir una factura o hacerme preguntas sobre la declaración.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Inicializar sesión de chat
  useEffect(() => {
    const session = startAiChat();
    setChatSession(session);
  }, []);

  // Auto-scroll al final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if ((!inputText.trim() && !attachedFile) || isProcessing) return;

    const userMessage = { 
      role: 'user', 
      text: inputText, 
      fileName: attachedFile?.name 
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    const fileToSend = attachedFile;
    setAttachedFile(null);
    setIsProcessing(true);

    try {
      const responseText = await sendChatMessage(chatSession, inputText, fileToSend);
      
      // Procesar la respuesta para extraer JSON si existe
      let cleanText = responseText;
      let formUpdates = null;

      const jsonMatch = responseText.match(/\{[\s\S]*"formUpdates"[\s\S]*\}/);
      if (jsonMatch) {
          try {
              const jsonStr = jsonMatch[0];
              const parsed = JSON.parse(jsonStr);
              formUpdates = parsed.formUpdates;
              // Limpiar el texto del JSON para que no se vea feo en el chat
              cleanText = responseText.replace(jsonStr, '').trim();
          } catch (e) {
              console.error("Error parsing AI JSON:", e);
          }
      }

      setMessages(prev => [...prev, { role: 'assistant', text: cleanText || 'Entendido. He procesado la información.' }]);

      if (formUpdates) {
          // Normalizar valores numéricos antes de enviar al formulario
          if (formUpdates.item?.totalValue) formUpdates.item.totalValue = normalizeValue(formUpdates.item.totalValue);
          if (formUpdates.transaction?.internationalFreight) formUpdates.transaction.internationalFreight = normalizeValue(formUpdates.transaction.internationalFreight);
          if (formUpdates.ai_metadata?.detected_freight) formUpdates.ai_metadata.detected_freight = normalizeValue(formUpdates.ai_metadata.detected_freight);
          if (formUpdates.ai_metadata?.detected_insurance) formUpdates.ai_metadata.detected_insurance = normalizeValue(formUpdates.ai_metadata.detected_insurance);

          onDataExtracted(formUpdates);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `Error de Conexión: ${error.message}. Por favor revisá tu consola o el archivo .env.` 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-700/50 flex flex-col h-[400px] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Asistente IA</h4>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-medium italic">Online - Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm flex gap-3 ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
            }`}>
              {m.role === 'assistant' && <Bot size={18} className="text-indigo-400 shrink-0 mt-0.5" />}
              <div className="space-y-2">
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                {m.fileName && (
                  <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2 border border-slate-700/50 text-xs text-indigo-300">
                    <FileText size={14} />
                    <span className="truncate max-w-[150px]">{m.fileName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-3 border border-slate-700/50 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-indigo-500" />
              <span className="text-xs font-medium italic">Pensando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 bg-slate-800/30 border-t border-slate-700/50">
        <AnimatePresence>
          {attachedFile && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-2"
            >
              <div className="flex items-center gap-2 text-indigo-300">
                <FileText size={16} />
                <span className="text-xs font-bold truncate max-w-[200px]">{attachedFile.name}</span>
              </div>
              <button 
                onClick={() => setAttachedFile(null)}
                className="p-1 hover:bg-indigo-500/20 rounded-full transition-colors"
              >
                <X size={14} className="text-indigo-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/50"
            title="Adjuntar archivo (PDF o Imagen)"
          >
            <Paperclip size={20} />
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={(e) => setAttachedFile(e.target.files[0])}
            accept="application/pdf,image/*"
          />

          <input 
            type="text"
            className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            placeholder="Escribí un mensaje..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />

          <button 
            onClick={handleSend}
            disabled={(!inputText.trim() && !attachedFile) || isProcessing}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              (!inputText.trim() && !attachedFile) || isProcessing
                ? 'bg-slate-700 text-slate-500 scale-95 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20 active:scale-90'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantChat;
