import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, RefreshCw } from 'lucide-react';

export default function QrScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Escanear Código QR'
}) {
  const [cameraError, setCameraError] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const scannerRef = useRef(null);
  const readerId = 'qr-reader-element';

  // Camera start logic
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    setCameraError(null);
    setIsCameraLoading(true);

    const timer = setTimeout(() => {
      const html5QrCode = new Html5Qrcode(readerId);
      scannerRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7;
              return { width: size, height: size };
            },
          },
          (decodedText) => {
            stopCamera();
            onScanSuccess(decodedText);
            onClose();
          },
          () => {
          }
        )
        .then(() => {
          setIsCameraLoading(false);
        })
        .catch((err) => {
          console.error('Error starting QR camera:', err);
          setCameraError(
            'No se pudo acceder a la cámara. Por favor asegurate de dar los permisos correspondientes.'
          );
          setIsCameraLoading(false);
        });
    }, 100);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .catch((err) => console.error('Error stopping QR scanner:', err));
      }
      scannerRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col relative animate-slide-down">
        {/* Header */}
        <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-black text-gray-800 text-sm">{title}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">LavaPro Scanner</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col items-center justify-center min-h-[250px] w-full">
          {cameraError ? (
            <div className="text-center p-4 bg-red-50 border border-red-100 rounded-xl space-y-2">
              <p className="text-xs text-red-700 font-medium leading-relaxed">{cameraError}</p>
            </div>
          ) : (
            <div className="relative w-full aspect-square max-w-[240px] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-inner flex items-center justify-center">
              {/* Scanner video box */}
              <div id={readerId} className="w-full h-full object-cover"></div>

              {/* Loading overlay */}
              {isCameraLoading && (
                <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="text-blue-500 animate-spin" size={24} />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Iniciando cámara...</span>
                </div>
              )}

              {/* Scanner overlay effect */}
              {!isCameraLoading && (
                <>
                  {/* Laser Line */}
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse z-10"></div>
                  
                  {/* Target box corners */}
                  <div className="absolute inset-8 border-2 border-dashed border-white/40 rounded-xl pointer-events-none"></div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
