import { X, Download, Printer } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function QrGeneratorModal({
  isOpen,
  onClose,
  qrData,
  title = 'Etiqueta QR de Pedido',
  subtitle = 'LavaPro Control de Trazabilidad'
}) {
  const { addToast } = useToast();

  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAVAPRO-PED-${qrData}&bgcolor=ffffff&qzone=4`;

  const handleDownload = async () => {
    try {
      addToast('Iniciando descarga del código QR...', 'success');
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_Pedido_${qrData}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading QR code:', err);
      window.open(qrImageUrl, '_blank');
      addToast('Descarga fallida por CORS. Se abrió el código QR en una pestaña nueva.', 'warning');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=350,height=400');
    if (!printWindow) {
      addToast('No se pudo abrir la ventana de impresión. Compruebe su bloqueador de ventanas emergentes.', 'warning');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir QR Pedido #${qrData}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
              background-color: white;
            }
            .container {
              text-align: center;
              padding: 20px;
              border: 1px dashed #ccc;
              border-radius: 8px;
              background-color: white;
            }
            img {
              width: 180px;
              height: 180px;
              display: block;
              margin: 0 auto;
            }
            h2 {
              margin: 15px 0 5px 0;
              font-size: 16px;
              font-weight: 900;
              letter-spacing: 0.05em;
              color: #111827;
              text-transform: uppercase;
            }
            p {
              margin: 0;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.05em;
              color: #6b7280;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${qrImageUrl}" alt="QR Pedido #${qrData}" />
            <h2>Pedido #${qrData}</h2>
            <p>LavaPro Control de Trazabilidad</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 300);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl flex flex-col relative animate-slide-down">
        {/* Header */}
        <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-black text-gray-800 text-sm tracking-tight">{title}</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{subtitle}</p>
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
        <div className="p-6 flex flex-col items-center justify-center bg-white space-y-4">
          <div className="bg-gray-900 p-5 rounded-2xl shadow-md w-full max-w-[200px] flex items-center justify-center">
            <div className="bg-white p-2.5 rounded-xl shadow-inner">
              <img
                src={qrImageUrl}
                alt={`QR Pedido #${qrData}`}
                className="w-36 h-36 object-contain"
              />
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              ID del Pedido: {qrData}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 py-2 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Download size={13} strokeWidth={2.5} />
            Descargar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Printer size={13} strokeWidth={2.5} />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
