import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronRight, ArrowLeft, QrCode } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import QrScannerModal from '../../components/ui/QrScannerModal';
import Button from '../../components/ui/Button';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';

export default function Clientes() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [clientesList, setClientesList] = useState([]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'add' | 'detail'
  const [selectedCliente, setSelectedCliente] = useState(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  const fetchClientes = () => {
    setLoading(true);
    api.getUsuarios()
      .then((data) => {
        // Filtrar solo los de rol cliente
        const clients = data.filter(u => u.rol === 'cliente');
        setClientesList(clients);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredClientes = clientesList.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cliente.DNI.includes(searchQuery)
  );

  const startAddView = () => {
    setNombre('');
    setApellido('');
    setDni('');
    setEmail('');
    setTelefono('');
    setView('add');
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const errors = [];
    if (!nombre.trim()) errors.push('Nombre');
    if (!apellido.trim()) errors.push('Apellido');
    if (!dni.trim()) errors.push('DNI (Documento)');
    if (!email.trim()) errors.push('Correo Electrónico');

    if (errors.length > 0) {
      addToast(`Por favor complete los siguientes campos obligatorios:\n- ${errors.join('\n- ')}`, 'warning');
      return;
    }

    const newCliente = {
      nombre: `${nombre} ${apellido}`,
      DNI: dni,
      email: email,
      telefono: telefono || null,
      rol: 'cliente'
    };

    setLoading(true);
    api.addUsuario(newCliente)
      .then(() => {
        addToast('Cliente registrado con éxito.', 'success');
        setView('list');
        fetchClientes();
      })
      .catch((err) => {
        addToast(err.message || 'Error al registrar el cliente.', 'error');
        setLoading(false);
      });
  };

  const handleQRScanSuccess = (code) => {
    const client = clientesList.find(c => c.codigo_qr === code || c.DNI === code);
    if (client) {
      setSelectedCliente(client);
      setView('detail');
    } else {
      addToast('Cliente no encontrado en el sistema.', 'warning');
    }
  };

  const scanClientQR = () => {
    setIsQRModalOpen(true);
  };

  if (loading && view === 'list') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-400">Cargando directorio de clientes...</p>
      </div>
    );
  }

  if (view === 'add') {
    return (
      <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
        <div className="flex justify-between items-center pl-1 border-b pb-3 mb-2 shrink-0">
          <div>
            <h3 className="text-base font-black text-gray-800">Registrar Cliente</h3>
            <p className="text-[11px] text-gray-400 font-medium">Cree el alta de cliente en el sistema.</p>
          </div>
          <button
            onClick={() => setView('list')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleAddSubmit} noValidate className="space-y-4">
          <FloatingLabelInput
            label="Nombre"
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <FloatingLabelInput
            label="Apellido"
            id="apellido"
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />

          <FloatingLabelInput
            label="DNI (Documento)"
            id="dni"
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
          />

          <FloatingLabelInput
            label="Correo Electrónico"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FloatingLabelInput
            label="Teléfono de Contacto (Opcional)"
            id="telefono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Crear Cuenta de Cliente'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'detail' && selectedCliente) {
    return (
      <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
        <div className="flex justify-between items-center pl-1 border-b pb-3 mb-2 shrink-0">
          <div>
            <h3 className="text-base font-black text-gray-800">Ficha del Cliente</h3>
            <p className="text-[11px] text-gray-400 font-medium">Información y contacto del usuario.</p>
          </div>
          <button
            onClick={() => setView('list')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-black text-lg">
              {selectedCliente.nombre.charAt(0)}
            </div>
            <div>
              <h4 className="font-extrabold text-gray-800 text-base">{selectedCliente.nombre}</h4>
              <p className="text-xs text-gray-400 font-bold">Cliente Registrado</p>
            </div>
          </div>

          <div className="border-t pt-3 space-y-2.5">
            <div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">DNI</p>
              <p className="text-xs font-bold text-gray-700">{selectedCliente.DNI}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Email</p>
              <p className="text-xs font-bold text-gray-700">{selectedCliente.email}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Teléfono</p>
              <p className="text-xs font-bold text-gray-700">{selectedCliente.telefono}</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={() => navigate('/pedidos', { state: { searchName: selectedCliente.nombre } })} variant="primary">
            Ver Pedidos del Cliente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
      <div>
        <h3 className="text-base font-black text-gray-800">Gestión de Clientes</h3>
        <p className="text-[11px] text-gray-400 font-medium">Administre el directorio de clientes y sus credenciales.</p>
      </div>

      <div className="shrink-0">
        <Button onClick={startAddView} variant="primary">
          <Plus size={16} strokeWidth={3} />
          Nuevo Cliente
        </Button>
      </div>

      {/* Buscador */}
      <div className="flex gap-2 shrink-0">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por DNI o Nombre..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all border-l-4 border-l-amber-500"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={14} />
        </div>

        <button
          onClick={scanClientQR}
          className="w-10 h-10 bg-black hover:bg-gray-900 text-white rounded-xl flex flex-col items-center justify-center shrink-0 shadow-sm transition-all active:scale-[0.95] cursor-pointer"
          title="Escanear credencial QR"
        >
          <QrCode size={16} strokeWidth={2.5} />
          <span className="text-[7px] font-black tracking-wide mt-0.5">QR</span>
        </button>
      </div>

      {/* Listado */}
      <div className="space-y-3 pt-1 flex-1">
        {filteredClientes.map(cliente => (
          <div
            key={cliente.id}
            onClick={() => {
              setSelectedCliente(cliente);
              setView('detail');
            }}
            className="bg-white border border-gray-200 rounded-xl p-3.5 flex justify-between items-center hover:border-amber-300 transition-all shadow-sm cursor-pointer"
          >
            <div>
              <h4 className="font-extrabold text-gray-800 text-sm">
                {cliente.nombre}
              </h4>
              <p className="text-[11px] text-gray-400 font-bold tracking-wide mt-0.5">
                DNI: {cliente.DNI}
              </p>
            </div>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        ))}

        {filteredClientes.length === 0 && (
          <div className="text-center py-8 text-xs text-gray-400">
            No se encontraron clientes.
          </div>
        )}
      </div>
      <QrScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanSuccess={handleQRScanSuccess}
        title="Buscar Cliente por QR / DNI"
        placeholder="Ingrese DNI o escanee credencial..."
        suggestedCodes={clientesList.map(c => ({ code: c.codigo_qr || c.DNI, label: c.nombre }))}
      />
    </div>
  );
}
