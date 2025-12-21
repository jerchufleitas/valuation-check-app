import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronRight } from 'lucide-react';

const faqData = [
  {
    id: 1,
    question: "¿Qué es el Valor en Aduana?",
    answer: "Es la base imponible sobre la cual se calculan los derechos de aduana. Generalmente es el valor de transacción (Precio pagado) más los ajustes del Artículo 8."
  },
  {
    id: 2,
    question: "¿Debo incluir el Flete Interno?",
    answer: "Depende del Incoterm. El Valor en Aduana debe incluir todos los gastos hasta el punto de entrada al país de importación. El flete 'interno' en el país de destino NO se incluye (Art. 1)."
  },
  {
    id: 3,
    question: "¿Qué ajustes suman (Art. 8)?",
    answer: "Se suman: Comisiones de venta, envases, embalajes, y prestaciones (bienes/servicios) suministradas gratis por el comprador."
  },
  {
    id: 4,
    question: "¿Qué conceptos se restan?",
    answer: "Se pueden deducir (si están desglosados): Intereses financieros, gastos de construcción/armado posteriores a la importación y derechos/impuestos del país de destino."
  },
  {
    id: 5,
    question: "No tengo el valor del seguro",
    answer: "Si no hay seguro real contratado, la Aduana suele aplicar un porcentaje presunto sobre el valor CFR (generalmente 1% o según norma local)."
  }
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: '¡Hola! Soy tu asistente virtual. 👋 ¿Tenés dudas sobre valoración o Incoterms? Selecciona una opción:' }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleQuestionClick = (faq) => {
    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: faq.question }]);
    
    // Simulate typing delay for bot
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: faq.answer }]);
    }, 600);
  };

  const handleContact = () => {
      setMessages(prev => [...prev, { type: 'user', text: 'Quiero contactar a un humano' }]);
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text: 'Claro, si tienes un caso complejo puedes escribirnos a: soporte@valuationcheck.com.ar (Respuesta en 24hs).' }]);
      }, 600);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className={`chatbot-trigger ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <div className="bot-avatar">AI</div>
            <span>Asistente Valuation</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-options">
          <p className="options-title">Preguntas frecuentes:</p>
          <div className="options-list">
            {faqData.map(faq => (
              <button key={faq.id} onClick={() => handleQuestionClick(faq)}>
                {faq.question} <ChevronRight size={14} />
              </button>
            ))}
            <button onClick={handleContact} style={{borderColor: '#d97706', color: '#d97706'}}>
               Hablar con Soporte <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
