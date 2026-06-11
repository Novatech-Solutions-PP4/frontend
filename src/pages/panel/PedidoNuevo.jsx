import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, QrCode, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import QrScannerModal from '../../components/ui/QrScannerModal';
import QrGeneratorModal from '../../components/ui/QrGeneratorModal';
import Button from '../../components/ui/Button';

export default function PedidoNuevo() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const isAdmin = user?.rol === 'administrador';

  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Selected services in the order: array of { id, quantity }
  const [selectedServices, setSelectedServices] = useState([{ servicioId: '', cantidad: 1 }]);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getUsuarios(), api.getServicios()])
      .then(([usersData, servsData]) => {
        const clientList = usersData.filter(u => u.rol === 'cliente');
        setClientes(clientList);
        setServicios(servsData);
        setLoading(false);

        // Pre-select client if navigated from global QR scan
        if (location.state?.selectedClient) {
          const client = clientList.find(c => c.id === location.state.selectedClient.id);
          if (client) {
            setSelectedClient(client);
            setClientSearch(client.nombre);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [location.state]);

  const handleClientSearchChange = (e) => {
    setClientSearch(e.target.value);
    setSelectedClient(null);
    setShowDropdown(true);
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setClientSearch(client.nombre);
    setShowDropdown(false);
  };

  const handleQRScanSuccess = (code) => {
    const client = clientes.find(c => c.codigo_qr === code || c.DNI === code);
    if (client) {
      selectClient(client);
    } else {
      addToast('Cliente no encontrado en el sistema con ese código o DNI.', 'warning');
    }
  };

  const scanClientQR = () => {
    setIsQRModalOpen(true);
  };

  const addServiceRow = () => {
    setSelectedServices([...selectedServices, { servicioId: '', cantidad: 1 }]);
  };

  const updateServiceRow = (index, field, value) => {
    const updated = [...selectedServices];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setSelectedServices(updated);
  };

  const removeServiceRow = (index) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  // Calculations
  const calculateTotals = () => {
    let total = 0;
    selectedServices.forEach(row => {
      const serviceObj = servicios.find(s => s.id === parseInt(row.servicioId));
      if (serviceObj) {
        total += serviceObj.precio * (parseInt(row.cantidad) || 1);
      }
    });
    const subtotal = total / 1.21;
    const tax = total - subtotal;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClient) {
      addToast('Por favor seleccione un cliente de la lista o escanee su QR.', 'warning');
      return;
    }

    const hasEmptyService = selectedServices.some(row => !row.servicioId);
    if (hasEmptyService) {
      addToast('Por favor seleccione un servicio válido en todas las filas agregadas.', 'warning');
      return;
    }

    const hasInvalidQty = selectedServices.some(row => isNaN(parseInt(row.cantidad)) || parseInt(row.cantidad) < 1);
    if (hasInvalidQty) {
      addToast('Por favor ingrese una cantidad válida mayor o igual a 1 en todas las filas.', 'warning');
      return;
    }

    const validServices = selectedServices.filter(row => row.servicioId);
    if (validServices.length === 0) {
      addToast('Por favor seleccione al menos un servicio.', 'warning');
      return;
    }

    const orderServices = [];
    validServices.forEach(row => {
      const serviceObj = servicios.find(s => s.id === parseInt(row.servicioId));
      if (serviceObj) {
        // Multiplicar según cantidad
        for (let i = 0; i < (parseInt(row.cantidad) || 1); i++) {
          orderServices.push({
            name: `${serviceObj.nombre}`,
            price: serviceObj.precio
          });
        }
      }
    });

    const newOrder = {
      id_usuario: selectedClient.id,
      id_servicios: validServices.flatMap(row => Array(parseInt(row.cantidad) || 1).fill(parseInt(row.servicioId))),
      cliente: selectedClient.nombre,
      services: orderServices,
      subtotal,
      tax,
      total,
      status: 'Ingresado',
      paymentStatus: 'Deuda'
    };

    api.addPedido(newOrder)
      .then((created) => {
        addToast(`Pedido creado con éxito en mostrador con ID #${created.id}.`, 'success');
        setCreatedOrderId(created.id);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleCloseQRModal = () => {
    setCreatedOrderId(null);
    navigate('/pedidos');
  };

  // Filter clients matching query
  const filteredClients = clientes.filter(c => 
    c.nombre.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.DNI.includes(clientSearch)
  );

  const themeFocusColor = isAdmin ? 'focus:border-purple-500 border-l-purple-500' : 'focus:border-amber-500 border-l-amber-500';

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className={`w-8 h-8 border-4 ${isAdmin ? 'border-purple-500 border-t-transparent' : 'border-blue-600 border-t-transparent'} rounded-full animate-spin`}></div>
        <p className="text-xs font-bold text-gray-400">Cargando formulario de alta...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
      {/* Header interno */}
      <div className="flex justify-between items-center border-b pb-3 mb-2 shrink-0">
        <div>
          <h3 className="text-base font-black text-gray-800">Crear Nuevo Pedido</h3>
          <p className="text-[11px] text-gray-400 font-medium">Complete los detalles para la orden de mostrador.</p>
        </div>
        <button
          onClick={() => navigate('/pedidos')}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Asignación de Cliente */}
        <div className="space-y-1.5 relative">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1">
            Asignación de Cliente
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={clientSearch}
                onChange={handleClientSearchChange}
                placeholder="Buscar por DNI o Nombre..."
                required
                className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all border-l-4 ${themeFocusColor}`}
              />
            </div>
            <button
              type="button"
              onClick={scanClientQR}
              className="w-10 h-10 bg-black hover:bg-gray-900 text-white rounded-xl flex flex-col items-center justify-center shrink-0 shadow-sm transition-all active:scale-[0.95] cursor-pointer"
              title="Escanear QR de credencial del cliente"
            >
              <QrCode size={14} />
              <span className="text-[7px] font-black tracking-wide mt-0.5">QR</span>
            </button>
          </div>

          {/* Dropdown de Clientes */}
          {showDropdown && clientSearch.length > 0 && (
            <div className="absolute left-0 right-12 top-full mt-1 bg-white border rounded-xl shadow-lg max-h-40 overflow-y-auto z-50">
              {filteredClients.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectClient(c)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs font-semibold text-gray-700 border-b last:border-none cursor-pointer"
                >
                  {c.nombre} (DNI: {c.DNI})
                </button>
              ))}
              {filteredClients.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400 text-center">
                  No se encontraron clientes coincidentes.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Listado de Servicios contratados */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1">
            Servicios Contratados
          </label>

          <div className="space-y-2">
            {selectedServices.map((row, index) => (
              <div key={index} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex gap-2 items-center">
                <div className="flex-1">
                  <select
                    value={row.servicioId}
                    onChange={(e) => updateServiceRow(index, 'servicioId', e.target.value)}
                    required
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Seleccionar Servicio --</option>
                    {servicios.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre} (${s.precio})</option>
                    ))}
                  </select>
                </div>
                <div className="w-16">
                  <input
                    type="number"
                    min="1"
                    value={row.cantidad}
                    onChange={(e) => updateServiceRow(index, 'cantidad', parseInt(e.target.value) || 1)}
                    required
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-center text-xs font-mono font-bold focus:outline-none"
                    placeholder="Cant."
                  />
                </div>
                {selectedServices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeServiceRow(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addServiceRow}
            className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-[11px] font-bold text-gray-400 hover:text-amber-600 hover:border-amber-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus size={12} />
            Agregar otro servicio
          </button>
        </div>

        {/* Resumen de totales */}
        {total > 0 && (
          <div className="bg-white border rounded-xl p-3.5 space-y-2 text-xs shadow-sm">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Costo Neto Subtotal</span>
              <span>${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium border-b pb-2">
              <span>Impuestos (IVA 21%)</span>
              <span>${tax.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
              <span>TOTAL ESTIMADO</span>
              <span className={isAdmin ? 'text-purple-600' : 'text-amber-600'}>
                ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" variant="primary">
            Generar Pedido e Imprimir QR
          </Button>
        </div>
      </form>
      <QrScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanSuccess={handleQRScanSuccess}
        title="Escanear Cliente por QR / DNI"
        placeholder="Ingrese DNI o escanee credencial..."
        suggestedCodes={clientes.map(c => ({ code: c.codigo_qr || c.DNI, label: c.nombre }))}
      />
      <QrGeneratorModal
        isOpen={!!createdOrderId}
        onClose={handleCloseQRModal}
        qrData={createdOrderId ? createdOrderId.toString() : ''}
        title={`Etiqueta QR de Pedido #${createdOrderId}`}
      />
    </div>
  );
}
