import { useState, useEffect } from 'react';
import { Plus, Search, ChevronRight, ArrowLeft, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import Button from '../../components/ui/Button';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';

export default function Servicios() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const isAdmin = user?.rol === 'administrador';

  const [serviciosList, setServiciosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Views: 'list' | 'add' | 'edit'
  const [view, setView] = useState('list');
  const [editingServicio, setEditingServicio] = useState(null);

  // Form states
  const [formNombre, setFormNombre] = useState('');
  const [formPrecio, setFormPrecio] = useState('');
  const [formUnidad, setFormUnidad] = useState('');
  const [formModalidad, setFormModalidad] = useState('');
  const [formInsumos, setFormInsumos] = useState([]); // Array of { insumoId, cantidad, unidadMedida }
  const [availableInsumos, setAvailableInsumos] = useState([]);

  const fetchServicios = () => {
    setLoading(true);
    Promise.all([api.getServicios(), api.getInsumos()])
      .then(([servsData, insData]) => {
        setServiciosList(servsData);
        setAvailableInsumos(insData.map(ins => ({
          id: ins.id,
          nombre: ins.nombre,
          stock: `${ins.cantidad} ${ins.nombre.toLowerCase().includes('mancha') ? 'Kg' : 'Lts'}`
        })));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredServicios = serviciosList.filter(serv =>
    serv.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startAddView = () => {
    setFormNombre('');
    setFormPrecio('');
    setFormUnidad('');
    setFormModalidad('');
    setFormInsumos([]);
    setView('add');
  };

  const startEditView = (servicio) => {
    setEditingServicio(servicio);
    setFormNombre(servicio.nombre);
    setFormPrecio(servicio.precio.toString());
    setFormUnidad(servicio.unidad);
    setFormModalidad(servicio.modalidad);
    setFormInsumos(servicio.insumos || []);
    setView('edit');
  };

  const addInsumoRow = () => {
    setFormInsumos([...formInsumos, { insumoId: '', cantidad: 0, unidadMedida: 'ml' }]);
  };

  const updateInsumoRow = (index, field, value) => {
    const updated = [...formInsumos];
    if (field === 'insumoId') {
      const insumoSelected = availableInsumos.find(ins => ins.id === parseInt(value));
      updated[index] = {
        ...updated[index],
        insumoId: parseInt(value),
        nombre: insumoSelected ? insumoSelected.nombre : ''
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value
      };
    }
    setFormInsumos(updated);
  };

  const removeInsumoRow = (index) => {
    setFormInsumos(formInsumos.filter((_, i) => i !== index));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const errors = [];
    if (!formNombre.trim()) errors.push('Nombre del Servicio');
    if (formPrecio === '' || isNaN(parseFloat(formPrecio)) || parseFloat(formPrecio) <= 0) errors.push('Precio de Venta (Debe ser mayor a 0)');
    if (!formUnidad) errors.push('Unidad de Limpieza');
    if (!formModalidad) errors.push('Modalidad de Service');

    // Validate active recipe rows
    const recipeErrors = [];
    formInsumos.forEach((ins, idx) => {
      if (!ins.insumoId) {
        recipeErrors.push(`Fila #${idx + 1}: Seleccione un insumo`);
      }
      if (ins.cantidad === '' || isNaN(parseInt(ins.cantidad)) || parseInt(ins.cantidad) <= 0) {
        recipeErrors.push(`Fila #${idx + 1}: Ingrese una cantidad válida mayor a 0`);
      }
    });

    if (errors.length > 0 || recipeErrors.length > 0) {
      const allErrors = [...errors, ...recipeErrors];
      addToast(`Por favor complete los siguientes campos correctamente:\n- ${allErrors.join('\n- ')}`, 'warning');
      return;
    }

    const newServicio = {
      nombre: formNombre,
      precio: parseFloat(formPrecio),
      unidad: formUnidad,
      modalidad: formModalidad,
      insumos: formInsumos.filter(i => i.insumoId)
    };

    setLoading(true);
    api.addServicio(newServicio)
      .then(() => {
        addToast('Servicio catalogado con éxito.', 'success');
        setView('list');
        fetchServicios();
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const errors = [];
    if (!formNombre.trim()) errors.push('Nombre del Servicio');
    if (formPrecio === '' || isNaN(parseFloat(formPrecio)) || parseFloat(formPrecio) <= 0) errors.push('Precio de Venta (Debe ser mayor a 0)');
    if (!formUnidad) errors.push('Unidad de Limpieza');
    if (!formModalidad) errors.push('Modalidad de Service');

    const recipeErrors = [];
    formInsumos.forEach((ins, idx) => {
      if (!ins.insumoId) {
        recipeErrors.push(`Fila #${idx + 1}: Seleccione un insumo`);
      }
      if (ins.cantidad === '' || isNaN(parseInt(ins.cantidad)) || parseInt(ins.cantidad) <= 0) {
        recipeErrors.push(`Fila #${idx + 1}: Ingrese una cantidad válida mayor a 0`);
      }
    });

    if (errors.length > 0 || recipeErrors.length > 0) {
      const allErrors = [...errors, ...recipeErrors];
      addToast(`Por favor complete los siguientes campos correctamente:\n- ${allErrors.join('\n- ')}`, 'warning');
      return;
    }

    const updated = {
      nombre: formNombre,
      precio: parseFloat(formPrecio),
      unidad: formUnidad,
      modalidad: formModalidad,
      insumos: formInsumos.filter(i => i.insumoId)
    };

    setLoading(true);
    api.updateServicio(editingServicio.id, updated)
      .then(() => {
        addToast('Servicio modificado con éxito.', 'success');
        setView('list');
        fetchServicios();
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '¿Está seguro?',
      message: `¿Está seguro de que desea dar de baja el servicio "${editingServicio.nombre}" del catálogo?`,
      type: 'danger',
      confirmLabel: 'Dar de Baja',
      cancelLabel: 'Cancelar'
    });

    if (confirmed) {
      setLoading(true);
      api.deleteServicio(editingServicio.id)
        .then(() => {
          addToast('Servicio deshabilitado con éxito.', 'success');
          setView('list');
          fetchServicios();
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  const getModalidadBadge = (modalidad) => {
    if (modalidad === 'Económico') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (modalidad === 'Estándar') return 'bg-purple-50 text-purple-700 border-purple-100';
    return 'bg-amber-50 text-amber-700 border-amber-100';
  };

  const themeFocusColor = isAdmin ? 'focus:border-purple-500 border-l-purple-500' : 'focus:border-blue-500 border-l-blue-500';

  if (loading && view === 'list') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className={`w-8 h-8 border-4 ${isAdmin ? 'border-purple-500 border-t-transparent' : 'border-blue-600 border-t-transparent'} rounded-full animate-spin`}></div>
        <p className="text-xs font-bold text-gray-400">Cargando catálogo...</p>
      </div>
    );
  }

  if (view === 'add') {
    return (
      <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
        <div className="flex justify-between items-center pl-1 border-b pb-3 mb-2 shrink-0">
          <div>
            <h3 className="text-base font-black text-gray-800">Crear Nuevo Servicio</h3>
            <p className="text-[11px] text-gray-400 font-medium">Defina los parámetros base y la combinación de insumos.</p>
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
            label="Nombre del Servicio"
            id="nombre_servicio"
            type="text"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
          />

          <FloatingLabelInput
            label="Precio de Venta ($)"
            id="precio_servicio"
            type="number"
            step="0.01"
            value={formPrecio}
            onChange={(e) => setFormPrecio(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Unidad de Limpieza</label>
            <select
              value={formUnidad}
              onChange={(e) => setFormUnidad(e.target.value)}
              required
              className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="">-- Seleccionar Unidad --</option>
              <option value="Canasto">Canasto</option>
              <option value="Acolchado">Acolchado</option>
              <option value="Calzado">Calzado</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Modalidad de Service</label>
            <select
              value={formModalidad}
              onChange={(e) => setFormModalidad(e.target.value)}
              required
              className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="">-- Seleccionar Modalidad --</option>
              <option value="Económico">Económico</option>
              <option value="Estándar">Estándar</option>
              <option value="Delicado">Delicado / Especial</option>
            </select>
          </div>

          {/* Dinamismo Receta */}
          <div className="pt-2 border-t mt-4 space-y-2">
            <div className="flex justify-between items-center pl-1">
              <label className="text-[10px] font-black text-purple-600 uppercase tracking-wider">
                Receta / Insumos Utilizados
              </label>
              <button
                type="button"
                onClick={addInsumoRow}
                className="text-[10px] font-extrabold text-blue-600 hover:underline cursor-pointer"
              >
                + Añadir Insumo
              </button>
            </div>

            <div className="space-y-2">
              {formInsumos.map((ins, index) => (
                <div key={index} className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Insumo #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeInsumoRow(index)}
                      className="text-[9px] font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={ins.insumoId}
                      onChange={(e) => updateInsumoRow(index, 'insumoId', e.target.value)}
                      required
                      className="col-span-2 bg-white border border-gray-200 rounded-lg p-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-purple-500"
                    >
                      <option value="">-- Seleccionar --</option>
                      {availableInsumos.map(av => (
                        <option key={av.id} value={av.id}>{av.nombre}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="Cant."
                        value={ins.cantidad || ''}
                        onChange={(e) => updateInsumoRow(index, 'cantidad', parseInt(e.target.value) || 0)}
                        required
                        className="w-full bg-white border border-gray-200 text-center text-xs font-mono font-bold rounded-lg p-2 focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-[9px] text-gray-400 font-bold">ml/g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear y Registrar Servicio'}
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
            <h3 className="text-base font-black text-gray-800">Gestionar Servicio</h3>
            <p className="text-[11px] text-gray-400 font-medium">Modifique las propiedades comerciales y receta.</p>
          </div>
          <button
            onClick={() => setView('list')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleEditSubmit} noValidate className="space-y-4">
          <FloatingLabelInput
            label="Nombre del Servicio"
            id="nombre_servicio"
            type="text"
            value={formNombre}
            onChange={(e) => setFormNombre(e.target.value)}
            required
          />

          <FloatingLabelInput
            label="Precio de Venta ($)"
            id="precio_servicio"
            type="number"
            step="0.01"
            value={formPrecio}
            onChange={(e) => setFormPrecio(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Unidad de Limpieza</label>
            <select
              value={formUnidad}
              onChange={(e) => setFormUnidad(e.target.value)}
              required
              className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="Canasto">Canasto</option>
              <option value="Acolchado">Acolchado</option>
              <option value="Calzado">Calzado</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Modalidad de Service</label>
            <select
              value={formModalidad}
              onChange={(e) => setFormModalidad(e.target.value)}
              required
              className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="Económico">Económico</option>
              <option value="Estándar">Estándar</option>
              <option value="Delicado">Delicado / Especial</option>
            </select>
          </div>

          {/* Dinamismo Receta */}
          <div className="pt-2 border-t mt-4 space-y-2">
            <div className="flex justify-between items-center pl-1">
              <label className="text-[10px] font-black text-purple-600 uppercase tracking-wider">
                Receta / Insumos Utilizados
              </label>
              <button
                type="button"
                onClick={addInsumoRow}
                className="text-[10px] font-extrabold text-blue-600 hover:underline cursor-pointer"
              >
                + Vincular Insumo
              </button>
            </div>

            <div className="space-y-2">
              {formInsumos.map((ins, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex-1 mr-3">
                    {ins.insumoId ? (
                      <>
                        <p className="text-xs font-bold text-gray-800">
                          {ins.nombre || availableInsumos.find(av => av.id === ins.insumoId)?.nombre || 'Insumo no seleccionado'}
                        </p>
                        <p className="text-[9px] text-gray-400 font-medium">
                          Stock actual: {availableInsumos.find(av => av.id === ins.insumoId)?.stock || 'N/A'}
                        </p>
                      </>
                    ) : (
                      <select
                        value={ins.insumoId}
                        onChange={(e) => updateInsumoRow(index, 'insumoId', e.target.value)}
                        required
                        className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:border-purple-500"
                      >
                        <option value="">-- Seleccionar --</option>
                        {availableInsumos.map(av => (
                          <option key={av.id} value={av.id}>{av.nombre}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 w-24 mr-2">
                    <input
                      type="number"
                      value={ins.cantidad || ''}
                      onChange={(e) => updateInsumoRow(index, 'cantidad', parseInt(e.target.value) || 0)}
                      required
                      className="w-full bg-white border border-gray-200 text-center text-xs font-mono font-bold rounded-lg p-1.5 focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-[10px] text-gray-500 font-bold">{ins.unidadMedida || 'ml'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInsumoRow(index)}
                    className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Modificaciones'}
            </Button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {loading ? 'Procesando...' : 'Dar de Baja Servicio'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
      <div>
        <h3 className="text-base font-black text-gray-800">Catálogo de Servicios</h3>
        <p className="text-[11px] text-gray-400 font-medium">Consulte tarifas, unidades y modalidades comerciales vigentes.</p>
      </div>

      {isAdmin && (
        <div className="shrink-0">
          <Button onClick={startAddView} variant="primary">
            <Plus size={16} strokeWidth={3} />
            Agregar Nuevo Servicio
          </Button>
        </div>
      )}

      {/* Buscador */}
      <div className="relative shrink-0">
        <input
          type="text"
          placeholder="Buscar servicio por nombre..."
          value={searchQuery}
          onChange={handleSearch}
          className={`w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white transition-all border-l-4 ${themeFocusColor}`}
        />
        <Search className="absolute left-3 top-3 text-gray-400" size={14} />
      </div>

      {/* Listado */}
      <div className="gap-3 pt-1 flex flex-row flex-wrap justify-around">
        {filteredServicios.map(serv => (
          <div
            key={serv.id}
            onClick={() => isAdmin && startEditView(serv)}
            className={`bg-white border border-gray-200 rounded-xl p-3.5 flex justify-between items-center transition-all shadow-sm ${
              isAdmin ? 'hover:border-purple-300 cursor-pointer' : 'hover:border-blue-300'
            }`}
          >
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-gray-800 text-xs uppercase tracking-wider">
                {serv.nombre}
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border border-gray-200">
                  {serv.unidad}
                </span>
                <span className={`text-[9px] border px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${getModalidadBadge(serv.modalidad)}`}>
                  {serv.modalidad}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gray-900">
                ${serv.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredServicios.length === 0 && (
          <div className="text-center py-8 text-xs text-gray-400">
            No se encontraron servicios en el catálogo.
          </div>
        )}
      </div>
    </div>
  );
}
