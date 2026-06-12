import { useState, useEffect } from 'react';
import { Plus, Search, ChevronRight, ArrowLeft, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import Button from '../../components/ui/Button';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';

export default function Insumos() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const isAdmin = user?.rol === 'administrador';

  const [insumosList, setInsumosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Views: 'list' | 'add' | 'edit'
  const [view, setView] = useState('list');
  const [editingInsumo, setEditingInsumo] = useState(null);

  // Form states
  const [formNombre, setFormNombre] = useState('');
  const [formCantidad, setFormCantidad] = useState('');
  const [formAlerta, setFormAlerta] = useState('');
  const [formCosto, setFormCosto] = useState('');

  const fetchInsumos = () => {
    setLoading(true);
    api.getInsumos()
      .then((data) => {
        setInsumosList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleQuickAddStock = async (insumo) => {
    const input = await confirm({
      title: `Registrar Compra para ${insumo.nombre}`,
      message: `¿Cuántas unidades desea SUMAR al stock actual (${insumo.cantidad})?`,
      isPrompt: true,
      inputType: 'number',
      placeholder: 'Cantidad a sumar...',
      confirmLabel: 'Sumar Stock',
      cancelLabel: 'Cancelar',
      type: 'info'
    });

    if (input === null || input === '') return;
    const toAdd = parseFloat(input);
    if (isNaN(toAdd) || toAdd <= 0) {
      addToast('Por favor ingrese una cantidad numérica válida mayor a 0.', 'warning');
      return;
    }

    const updated = {
      nombre: insumo.nombre,
      cantidad: insumo.cantidad + toAdd,
      alerta: insumo.alerta,
      costo: insumo.costo
    };

    setLoading(true);
    api.updateInsumo(insumo.id, updated)
      .then(() => {
        addToast(`Se han añadido ${toAdd} unidades a ${insumo.nombre}.`, 'success');
        fetchInsumos();
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredInsumos = insumosList.filter(insumo =>
    insumo.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startAddView = () => {
    setFormNombre('');
    setFormCantidad('');
    setFormAlerta('');
    setFormCosto('');
    setView('add');
  };

  const startEditView = (insumo) => {
    setEditingInsumo(insumo);
    setFormNombre(insumo.nombre);
    setFormCantidad(insumo.cantidad);
    setFormAlerta(insumo.alerta);
    setFormCosto(insumo.costo);
    setView('edit');
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const errors = [];
    if (!formNombre.trim()) errors.push('Nombre del Material');
    if (formCantidad === '' || isNaN(parseInt(formCantidad)) || parseInt(formCantidad) < 0) errors.push('Cantidad Disponible (Debe ser mayor o igual a 0)');
    if (formAlerta === '' || isNaN(parseInt(formAlerta)) || parseInt(formAlerta) < 0) errors.push('Umbral de Stock Mínimo (Debe ser mayor o igual a 0)');
    if (formCosto === '' || isNaN(parseFloat(formCosto)) || parseFloat(formCosto) < 0) errors.push('Costo Unitario (Debe ser mayor o igual a 0)');

    if (errors.length > 0) {
      addToast(`Por favor complete los siguientes campos correctamente:\n- ${errors.join('\n- ')}`, 'warning');
      return;
    }

    const newInsumo = {
      nombre: formNombre,
      cantidad: parseInt(formCantidad),
      alerta: parseInt(formAlerta),
      costo: parseFloat(formCosto)
    };
    
    setLoading(true);
    api.addInsumo(newInsumo)
      .then(() => {
        addToast('Insumo registrado con éxito.', 'success');
        setView('list');
        fetchInsumos();
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const errors = [];
    if (!formNombre.trim()) errors.push('Nombre del Material');
    if (formCantidad === '' || isNaN(parseInt(formCantidad)) || parseInt(formCantidad) < 0) errors.push('Cantidad Disponible (Debe ser mayor o igual a 0)');
    if (formAlerta === '' || isNaN(parseInt(formAlerta)) || parseInt(formAlerta) < 0) errors.push('Umbral de Stock Mínimo (Debe ser mayor o igual a 0)');
    if (formCosto === '' || isNaN(parseFloat(formCosto)) || parseFloat(formCosto) < 0) errors.push('Costo Unitario (Debe ser mayor o igual a 0)');

    if (errors.length > 0) {
      addToast(`Por favor complete los siguientes campos correctamente:\n- ${errors.join('\n- ')}`, 'warning');
      return;
    }

    const updated = {
      nombre: formNombre,
      cantidad: parseInt(formCantidad),
      alerta: parseInt(formAlerta),
      costo: parseFloat(formCosto)
    };
    
    setLoading(true);
    api.updateInsumo(editingInsumo.id, updated)
      .then(() => {
        addToast('Cambios guardados con éxito.', 'success');
        setView('list');
        fetchInsumos();
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '¿Está seguro?',
      message: `¿Está seguro de dar de baja el insumo "${editingInsumo.nombre}"?`,
      type: 'danger',
      confirmLabel: 'Dar de Baja',
      cancelLabel: 'Cancelar'
    });

    if (confirmed) {
      setLoading(true);
      api.deleteInsumo(editingInsumo.id)
        .then(() => {
          addToast('Insumo deshabilitado correctamente.', 'success');
          setView('list');
          fetchInsumos();
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  if (loading && view === 'list') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className={`w-8 h-8 border-4 ${isAdmin ? 'border-purple-500 border-t-transparent' : 'border-blue-600 border-t-transparent'} rounded-full animate-spin`}></div>
        <p className="text-xs font-bold text-gray-400">Cargando insumos...</p>
      </div>
    );
  }

  if (view === 'add') {
    return (
      <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
        <div className="flex justify-between items-center pl-1 border-b pb-3 mb-2 shrink-0">
          <div>
            <h3 className="text-base font-black text-gray-800">Agregar Nuevo Insumo</h3>
            <p className="text-[11px] text-gray-400 font-medium">Define los parámetros base del material.</p>
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
            label="Nombre del Material"
            id="nombre"
            type="text"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
          />

          <FloatingLabelInput
            label="Cantidad Disponible"
            id="cantidad"
            type="number"
            value={formCantidad}
            onChange={(e) => setFormCantidad(e.target.value)}
            required
          />

          <div className="space-y-1">
            <FloatingLabelInput
              label="Umbral de Stock Mínimo (Alerta)"
              id="alerta"
              type="number"
              value={formAlerta}
              onChange={(e) => setFormAlerta(e.target.value)}
              required
            />
            <p className="text-[9px] text-gray-400 font-medium italic pl-1">
              Si el stock cae por debajo de este valor, se dispararán las alertas visuales en el sistema.
            </p>
          </div>

          <FloatingLabelInput
            label="Costo Unitario Actual ($)"
            id="costo"
            type="number"
            step="0.01"
            value={formCosto}
            onChange={(e) => setFormCosto(e.target.value)}
            required
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Insumo'}
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
            <h3 className="text-base font-black text-gray-800">Modificar Insumo</h3>
            <p className="text-[11px] text-gray-400 font-medium">Actualice existencias, alertas de stock mínimo o costos.</p>
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
              ID: {editingInsumo.id}
            </span>
          </div>

          <FloatingLabelInput
            label="Nombre del Material"
            id="nombre"
            type="text"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
          />

          <FloatingLabelInput
            label="Cantidad Disponible"
            id="cantidad"
            type="number"
            value={formCantidad}
            onChange={(e) => setFormCantidad(e.target.value)}
            required
          />

          <div className="space-y-1">
            <FloatingLabelInput
              label="Umbral de Stock Mínimo (Alerta)"
              id="alerta"
              type="number"
              value={formAlerta}
              onChange={(e) => setFormAlerta(e.target.value)}
              required
            />
            <p className="text-[9px] text-gray-400 font-medium italic pl-1">
              Si el stock cae por debajo de este valor, se dispararán las alertas visuales en el sistema.
            </p>
          </div>

          <FloatingLabelInput
            label="Costo Unitario Actual ($)"
            id="costo"
            type="number"
            step="0.01"
            value={formCosto}
            onChange={(e) => setFormCosto(e.target.value)}
            required
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
              {loading ? 'Procesando...' : 'Dar de Baja Insumo'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // List View
  return (
    <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-black text-gray-800">Stock de Insumos</h3>
          <p className="text-[11px] text-gray-400 font-medium">
            {isAdmin ? 'Gestión total de inventario y costos.' : 'Consulte la disponibilidad de materiales antes de operar.'}
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="shrink-0">
          <Button onClick={startAddView} variant="primary">
            <Plus size={16} strokeWidth={3} />
            Agregar Nuevo Insumo
          </Button>
        </div>
      )}

      {/* Buscador */}
      <div className="relative shrink-0">
        <input
          type="text"
          placeholder="Buscar insumo por nombre..."
          value={searchQuery}
          onChange={handleSearch}
          className={`w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all border-l-4 ${
            isAdmin ? 'focus:border-purple-500 border-l-purple-500' : 'focus:border-amber-500 border-l-amber-500'
          }`}
        />
        <Search className="absolute left-3 top-3 text-gray-400" size={14} />
      </div>

      {/* Listado */}
      <div className="space-y-3 pt-1 flex flex-row flex-wrap justify-around">
        {filteredInsumos.map(insumo => {
          const isCritical = insumo.cantidad < insumo.alerta;
          return (
            <div
              key={insumo.id}
              className={`bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm transition-all hover:border-gray-300 ${
                isCritical ? 'border-red-500 bg-red-50/10' : 'border-gray-200'
              }`}
            >
              <div>
                <h4 className={`font-extrabold text-xs uppercase tracking-wider ${isCritical ? 'text-red-700' : 'text-gray-500'}`}>
                  {insumo.nombre}
                </h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl font-black ${isCritical ? 'text-red-600' : 'text-gray-900'}`}>
                    {insumo.cantidad}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      Costo: ${insumo.costo.toLocaleString('es-AR')}
                    </span>
                  )}
                  {isCritical && (
                    <span className="text-[9px] text-gray-400 font-bold ml-1">
                      Mín: {insumo.alerta}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isCritical ? (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[9px] font-black rounded uppercase tracking-wide animate-pulse">
                    Crítico
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black rounded uppercase tracking-wide">
                    Disponible
                  </span>
                )}

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickAddStock(insumo)}
                      className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 border border-gray-200 rounded-xl shadow-sm transition-all cursor-pointer"
                      title="Registrar Compra / Recargar Stock"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditView(insumo)}
                      className="p-2.5 bg-gray-50 hover:bg-purple-50 text-gray-400 hover:text-purple-600 border border-gray-200 rounded-xl shadow-sm transition-all cursor-pointer"
                      title="Editar Insumo"
                    >
                      <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredInsumos.length === 0 && (
          <div className="text-center py-8 text-xs text-gray-400">
            No se encontraron insumos con ese nombre.
          </div>
        )}
      </div>
    </div>
  );
}
