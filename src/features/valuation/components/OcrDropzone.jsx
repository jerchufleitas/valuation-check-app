import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';

const OcrDropzone = ({ onDataExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = async (files) => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate upload/processing progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Mock OCR result based on typical invoice data
    // In a real scenario, this would be a fetch() to an LLM/OCR endpoint
    const mockExtractedData = {
      header: {
        exporterName: 'CHENGDU V-SHINE TECHNOLOGY CO., LTD.',
        exporterTaxId: '91510100MA6C9Y8X9R',
        importerName: 'IMPORTACIONES MARITIMAS S.A.',
        importerDetails: 'ARGENTINA / BUENOS AIRES',
      },
      transaction: {
        currency: 'USD',
        incoterm: 'CIF',
        loadingPlace: 'SHANGHAI PORT',
      },
      item: {
        ncmCode: '8517.62.77.100A',
        quantity: '50',
        unit: 'UN',
        unitValue: '125.50',
        totalValue: '6275.00',
        description: 'ROUTER INDUSTRIAL AC1200 - MODEL VSH-500. DUAL BAND.',
      },
      adjustments: {
        additions: { 
          'inland_freight': { active: true, amount: '700' } 
        }
      },
      documentation: {
        invoiceNumber: 'CX-1325PI',
        originCertificateAttached: 'SI'
      }
    };

    setIsProcessing(false);
    onDataExtracted(mockExtractedData);
  };

  return (
    <div 
      className={`ocr-dropzone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
    >
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        style={{ display: 'none' }} 
      />
      
      <div className="ocr-content">
        {isProcessing ? (
          <div className="processing-state">
            <Loader2 className="spinner" size={40} />
            <p>Procesando documentos ({progress}%)...</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <>
            <div className="ocr-icon-group">
              <Upload size={32} />
              <FileText size={32} />
            </div>
            <div className="ocr-text">
              <h4>MÓDULO OCR INTELIGENTE</h4>
              <p>Arrastre su Factura Proforma, Packing List o Imagen para auto-completar el formulario</p>
              <span className="file-types">Admite PDF, XLSX, JPG, DOCX</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OcrDropzone;
