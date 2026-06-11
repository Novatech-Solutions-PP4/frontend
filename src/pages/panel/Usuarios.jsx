import { useState, useEffect } from 'react';
import { Plus, Search, ChevronRight, ArrowLeft, Trash2, QrCode } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import QrScannerModal from '../../components/ui/QrScannerModal';
import Button from '../../components/ui/Button';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';

export default function Usuarios() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [usuariosList, setUsuariosList] = useState([]);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingUsuario, setEditingUsuario] = useState(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rolId, setRolId] = useState('');

  const fetchUsuarios = () => {
    setLoading(true);
    api.getUsuarios()
      .then((data) => {
        setUsuariosList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsuarios = usuariosList.filter(usuario => {
    const term = searchQuery.toLowerCase();
    return (
      usuario.nombre.toLowerCase().includes(term) ||
      usuario.DNI.includes(term) ||
      usuario.rol.toLowerCase().includes(term)
    );
  });

  const startAddView = () => {
    setNombre('');
    setApellido('');
    setDni('');
    setEmail('');
    setTelefono('');
    setRolId('');
    setView('add');
  };

  const startEditView = (usuario) => {
    setEditingUsuario(usuario);
    const parts = usuario.nombre.split(' ');
    setNombre(parts[0] || '');
    setApellido(parts.slice(1).join(' ') || '');
    setDni(usuario.DNI);
    setEmail(usuario.email);
    setTelefono(usuario.telefono);
    
    // Map string role to ID
    const roleMap = { administrador: '1', operador: '2', cliente: '3' };
    setRolId(roleMap[usuario.rol] || '');
    setView('edit');
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const errors = [];
    if (!nombre.trim()) errors.push('Nombre');
    if (!apellido.trim()) errors.push('Apellido');
    if (!dni.trim()) errors.push('DNI (Documento)');
    if (!rolId) errors.push('Asignación de Rol Corporativo');
    if (!email.trim()) errors.push('Correo Electrónico');

    if (errors.length > 0) {
      addToast(`Por favor complete los siguientes campos obligatorios:\n- ${errors.join('\n- ')}`, 'warning');
      return;
    }

    const roleIdMap = { '1': 'administrador', '2': 'operador', '3': 'cliente' };
    const newUsuario = {
      nombre: `${nombre} ${apellido}`,
      DNI: dni,
      email: email,
      telefono: telefono || null,
      rol: roleIdMap[rolId] || 'cliente'
    };

    setLoading(true);
    api.addUsuario(newUsuario)
      .then(() => {
        addToast('Usuario registrado con éxito.', 'success');
        setView('list');
        fetchUsuarios();
      })
      .catch((err) => {
        addToast(err.message || 'Error al registrar el usuario.', 'error');
        setLoading(false);
      });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const errors = [];
    if (!nombre.trim()) errors.push('Nombre');
    if (!apellido.trim()) errors.push('Apellido');
    if (!dni.trim()) errors.push('DNI (Documento)');
    if (!rolId) errors.push('Asignación de Rol Corporativo');
    if (!email.trim()) errors.push('Correo Electrónico');

    if (errors.length > 0) {
      addToast(`Por favor complete los siguientes campos obligatorios:\n- ${errors.join('\n- ')}`, 'warning');
      return;
    }

    const roleIdMap = { '1': 'administrador', '2': 'operador', '3': 'cliente' };
    const updated = {
      nombre: `${nombre} ${apellido}`,
      DNI: dni,
      email: email,
      telefono: telefono || null,
      rol: roleIdMap[rolId] || editingUsuario.rol
    };

    setLoading(true);
    api.updateUsuario(editingUsuario.id, updated)
      .then(() => {
        addToast('Cambios guardados con éxito.', 'success');
        setView('list');
        fetchUsuarios();
      })
      .catch((err) => {
        addToast(err.message || 'Error al guardar los cambios del usuario.', 'error');
        setLoading(false);
      });
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '¿Está seguro?',
      message: `¿Está seguro de eliminar al usuario "${editingUsuario.nombre}"?`,
      type: 'danger',
      confirmLabel: 'Eliminar Usuario',
      cancelLabel: 'Cancelar'
    });

    if (confirmed) {
      setLoading(true);
      api.deleteUsuario(editingUsuario.id)
        .then(() => {
          addToast('Usuario deshabilitado con éxito.', 'success');
          setView('list');
          fetchUsuarios();
        })
        .catch((err) => {
          addToast(err.message || 'Error al deshabilitar el usuario.', 'error');
          setLoading(false);
        });
    }
  };

  const handleQRScanSuccess = (code) => {
    const found = usuariosList.find(u => u.codigo_qr === code || u.DNI === code);
    if (found) {
      startEditView(found);
    } else {
      addToast('Usuario no encontrado en el sistema.', 'warning');
    }
  };

  const scanUserQR = () => {
    setIsQRModalOpen(true);
  };

  const getRoleBadgeClass = (rol) => {
    if (rol === 'administrador') return 'bg-purple-50 text-purple-600 border-purple-100';
    if (rol === 'operador') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  if (loading && view === 'list') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-400">Cargando usuarios...</p>
      </div>
    );
  }

  if (view === 'add') {
    return (
      <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
        <div className="flex justify-between items-center pl-1 border-b pb-3 mb-2 shrink-0">
          <div>
            <h3 className="text-base font-black text-gray-800">Registrar Usuario</h3>
            <p className="text-[11px] text-gray-400 font-medium">De alta a personal de planta, administradores o clientes.</p>
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

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1">
              Asignación de Rol Corporativo
            </label>
            <select
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              required
              className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="">-- Seleccionar Permiso --</option>
              <option value="1">Administrador (Control total)</option>
              <option value="2">Operador (Planta de lavado)</option>
              <option value="3">Cliente (Usuario externo)</option>
            </select>
          </div>

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
              {loading ? 'Procesando...' : 'Registrar Cuenta de Usuario'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'edit') {
    return (
      <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
        <div className="flex justify-between items-center pl-1 border-b pb-3 mb-2 shrink-0">
          <div>
            <h3 className="text-base font-black text-gray-800">Modificar Usuario</h3>
            <p className="text-[11px] text-gray-400 font-medium">Modifique permisos o datos del usuario.</p>
          </div>
          <button
            onClick={() => setView('list')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleEditSubmit} noValidate className="space-y-4">
          <div className="text-right">
            <span className="text-[9px] bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded font-black uppercase tracking-wide">
              ID: {editingUsuario.id}
            </span>
          </div>

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

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1">
              Asignación de Rol Corporativo
            </label>
            <select
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              required
              className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl p-3 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="1">Administrador (Control total)</option>
              <option value="2">Operador (Planta de lavado)</option>
              <option value="3">Cliente (Usuario externo)</option>
            </select>
          </div>

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

          <div className="space-y-2 pt-3">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {loading ? 'Procesando...' : 'Dar de Baja Usuario'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
      <div>
        <h3 className="text-base font-black text-gray-800">Control de Usuarios</h3>
        <p className="text-[11px] text-gray-400 font-medium">Gestione jerarquías, personal de planta y cuentas externas.</p>
      </div>

      <div className="shrink-0">
        <Button onClick={startAddView} variant="primary">
          <Plus size={16} strokeWidth={3} />
          Nuevo Usuario / Personal
        </Button>
      </div>

      {/* Buscador */}
      <div className="flex gap-2 shrink-0">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar DNI, Nombre o Rol..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-purple-500 transition-all border-l-4 border-l-purple-500"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={14} />
        </div>

        <button
          onClick={scanUserQR}
          className="w-10 h-10 bg-black hover:bg-gray-900 text-white rounded-xl flex flex-col items-center justify-center shrink-0 shadow-sm transition-all active:scale-[0.95] cursor-pointer"
          title="Auditar credencial QR"
        >
          <QrCode size={16} strokeWidth={2.5} />
          <span className="text-[7px] font-black tracking-wide mt-0.5">QR</span>
        </button>
      </div>

      {/* Listado */}
      <div className="space-y-3 pt-1 flex-1">
        {filteredUsuarios.map(usuario => (
          <div
            key={usuario.id}
            onClick={() => startEditView(usuario)}
            className="bg-white border border-gray-200 rounded-xl p-3.5 flex justify-between items-center hover:border-purple-300 transition-all shadow-sm cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-gray-800 text-sm">
                  {usuario.nombre}
                </h4>
                <span className={`text-[8px] border px-1.5 py-0.5 rounded font-black uppercase tracking-wide ${getRoleBadgeClass(usuario.rol)}`}>
                  {usuario.rol === 'administrador' ? 'Admin' : usuario.rol}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-bold tracking-wide mt-1">
                DNI: {usuario.DNI}
              </p>
            </div>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        ))}

        {filteredUsuarios.length === 0 && (
          <div className="text-center py-8 text-xs text-gray-400">
            No se encontraron usuarios.
          </div>
        )}
      </div>
      <QrScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanSuccess={handleQRScanSuccess}
        title="Auditar Usuario por QR / DNI"
        placeholder="Ingrese DNI o escanee credencial..."
        suggestedCodes={usuariosList.map(u => ({ code: u.codigo_qr || u.DNI, label: `${u.nombre} (${u.rol === 'administrador' ? 'Admin' : u.rol})` }))}
      />
    </div>
  );
}
