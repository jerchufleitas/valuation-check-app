import { analyzeDocument } from '../../../services/geminiService';

const OcrDropzone = ({ onDataExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) processFiles(files);
  };

  const processFiles = async (files) => {
    setIsProcessing(true);
    setProgress(10); // Feedback inicial
    setError(null);

    try {
      // Tomamos el primer archivo (MVP: soporte single file primero)
      // Gemini acepta imagenes (png, jpg, webp) y PDF (si se configura correctamente, por ahora nos centramos en imagenes)
      const file = files[0];
      
      // Validar tipo (básico)
      if (file.type !== 'application/pdf') {
         throw new Error('Solo se admiten documentos PDF.');
      }

      setProgress(30);
      // Llamada REAL a la IA
      const aiData = await analyzeDocument(file);
      
      setProgress(90);

      // Mapeo Inteligente: Convertimos la respuesta de Gemini a la estructura interna de la App
      const mappedData = {
        header: {
          exporterName: aiData.header?.exporterName || '',
          importerName: aiData.header?.importerName || '',
          transportDocument: aiData.header?.transportDocument || '',
          // Default logic if missing
          transportMode: 'Maritimo' // Asumimos marítimo si no se sabe, o dejamos el default del form
        },
        transaction: {
          currency: aiData.transaction?.currency || 'DOL',
          incoterm: aiData.transaction?.incoterm || 'FOB',
          loadingPlace: aiData.transaction?.loadingPlace || ''
        },
        item: {
          totalValue: aiData.item?.totalValue ? String(aiData.item.totalValue) : '',
          ncmCode: aiData.item?.ncmCode || '',
          description: 'Productos varios (Autodetectado)'
        },
        // Pasamos banderas y sugerencias especiales
        ai_metadata: {
           flags: aiData.review_flags || [],
           detected_freight: aiData.adjustments_detected?.freight,
           detected_insurance: aiData.adjustments_detected?.insurance
        }
      };

      setProgress(100);
      
      // Pequeño delay manual apra que el usuario vea el 100%
      setTimeout(() => {
        onDataExtracted(mappedData);
        setIsProcessing(false);
      }, 500);

    } catch (err) {
      console.error(err);
      setError(err.message || "Error desconocido al analizar documento.");
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className={`ocr-dropzone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''} ${error ? 'error-border' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isProcessing && fileInputRef.current.click()}
      style={{ borderColor: error ? '#ef4444' : undefined }}
    >
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        style={{ display: 'none' }} 
        accept="application/pdf"
      />
      
      <div className="ocr-content">
        {isProcessing ? (
          <div className="processing-state">
            <Loader2 className="spinner" size={40} />
            <p>Analizando documento con IA...</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : error ? (
           <div className="text-center p-4">
             <div className="text-red-500 font-bold mb-2">¡Error de Análisis!</div>
             <p className="text-sm text-slate-400 mb-4">{error}</p>
             <button onClick={(e) => { e.stopPropagation(); setError(null); }} className="text-xs bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">Intentar de nuevo</button>
           </div>
        ) : (
          <>
            <div className="ocr-icon-group relative">
              <Upload size={32} />
              <FileText size={32} />
              {/* Badge IA */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1 shadow-lg animate-pulse">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/></svg>
              </div>
            </div>
            <div className="ocr-text">
              <h4>MÓDULO IA / OCR</h4>
              <p>Arrastre una Factura o Packing List para autocompletado inteligente</p>
              <span className="file-types text-xs text-purple-300">Potenciado por Gemini 1.5 Flash</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OcrDropzone;
