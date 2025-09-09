import React, { useState, useRef } from 'react';

interface DataManagerProps {
  onClose: () => void;
  onClearData: () => void;
  onExportData: () => string;
  onImportData: (data: string) => boolean;
}

const DataManager: React.FC<DataManagerProps> = ({
  onClose,
  onClearData,
  onExportData,
  onImportData,
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = onExportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      link.href = url;
      link.download = `presupuesto-backup-${dateStr}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setImportStatus('success');
      setImportMessage('Datos exportados exitosamente');
      
      setTimeout(() => {
        setImportStatus('idle');
        setImportMessage('');
      }, 3000);
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Error al exportar los datos');
      
      setTimeout(() => {
        setImportStatus('idle');
        setImportMessage('');
      }, 3000);
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = onImportData(content);
        
        if (success) {
          setImportStatus('success');
          setImportMessage('Datos importados exitosamente');
          
          setTimeout(() => {
            setImportStatus('idle');
            setImportMessage('');
            onClose();
          }, 2000);
        } else {
          setImportStatus('error');
          setImportMessage('El archivo no tiene un formato válido');
        }
      } catch (error) {
        setImportStatus('error');
        setImportMessage('Error al leer el archivo');
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (importStatus === 'error') {
        setTimeout(() => {
          setImportStatus('idle');
          setImportMessage('');
        }, 3000);
      }
    };

    reader.readAsText(file);
  };

  const handleClearData = () => {
    onClearData();
    setShowConfirmClear(false);
    setImportStatus('success');
    setImportMessage('Datos eliminados exitosamente');
    
    setTimeout(() => {
      setImportStatus('idle');
      setImportMessage('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Gestionar Datos</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl">✖️</span>
          </button>
        </div>

        {/* Status Message */}
        {importMessage && (
          <div className={`mb-4 p-3 rounded-lg border ${
            importStatus === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <span>{importStatus === 'success' ? '✅' : '❌'}</span>
              <span className="text-sm">{importMessage}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Export Data */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>📤</span>
              Exportar Datos
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Descarga una copia de seguridad de todos tus datos de presupuesto
            </p>
            <button
              onClick={handleExport}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Descargar Backup
            </button>
          </div>

          {/* Import Data */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>📥</span>
              Importar Datos
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Restaura tu presupuesto desde un archivo de backup
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer block text-center"
            >
              Seleccionar Archivo
            </label>
          </div>

          {/* Clear Data */}
          <div className="border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <span>🗑️</span>
              Eliminar Todos los Datos
            </h3>
            <p className="text-sm text-red-600 mb-3">
              Esta acción eliminará permanentemente todos tus datos de presupuesto
            </p>
            
            {!showConfirmClear ? (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Eliminar Todo
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-800">
                  ¿Estás seguro? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearData}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Sí, Eliminar
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auto-save Info */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <p className="text-sm text-blue-800">
              <strong>Guardado automático:</strong> Tus datos se guardan automáticamente en tu navegador cada vez que realizas un cambio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManager;