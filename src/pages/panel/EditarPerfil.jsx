import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

export default function EditarPerfil() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  if (!user) return null;

  const isClient = user.rol === 'cliente';
  const isOperator = user.rol === 'operador';

  const parts = (user.nombre || '').split(' ');
  const initialNombre = parts[0] || '';
  const initialApellido = parts.slice(1).join(' ') || '';

  const [nombre, setNombre] = useState(initialNombre);
  const [apellido, setApellido] = useState(initialApellido);
  const [telefono, setTelefono] = useState(user.telefono || '');
  const [email, setEmail] = useState(user.email || '');
  const dni = user.DNI || ''; // Read-only
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = [];
    if (!nombre.trim()) errors.push('Nombre');
    // Apellido es obligatorio si no es operador ni admin sin apellido cargado
    const isLastNameRequired = !isOperator && user.rol !== 'administrador';
    if (isLastNameRequired && !apellido.trim()) {
      errors.push('Apellido');
    }
    if (!email.trim()) errors.push('Correo Electrónico');

    if (errors.length > 0) {
      addToast(`Por favor complete los siguientes campos obligatorios:\n- ${errors.join('\n- ')}`, 'warning');
      return;
    }
    
    setSaving(true);
    
    const updated = {
      nombre: `${nombre} ${apellido}`.trim(),
      email,
      telefono: telefono || null,
      DNI: dni
    };

    api.updateUsuario(user.id, updated)
      .then((updatedUser) => {
        updateUser(updatedUser);
        addToast('Perfil actualizado con éxito.', 'success');
        navigate('/perfil');
      })
      .catch((err) => {
        addToast(err.message || 'Error al actualizar el perfil.', 'warning');
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <div className="flex-1 flex flex-col justify-start space-y-5 overflow-y-auto pr-1">
      {/* HEADER SUPERIOR INTERNO */}
      <div className="flex justify-between items-center border-b pb-3 mb-2 shrink-0">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            LavaPro App
          </p>
          <h2 className="text-md font-bold text-gray-800">Configuración</h2>
        </div>
        <button
          onClick={() => navigate('/perfil')}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
          aria-label="Volver al perfil"
        >
          <ArrowLeft size={18} strokeWidth={3} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-gray-800 shrink-0">
        <h3 className="text-base font-black tracking-tight">Editar Perfil</h3>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 flex-1">
        {/* Campo: Nombre */}
        <div className="space-y-1">
          <label
            htmlFor="nombre"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1"
          >
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Campo: Apellido */}
        <div className="space-y-1">
          <label
            htmlFor="apellido"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1"
          >
            Apellido
          </label>
          <input
            type="text"
            id="apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required={!isOperator && user.rol !== 'administrador'} // Opcional para admin sin apellido cargado
            className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Campo: DNI */}
        <div className="space-y-1 opacity-60">
          <label
            htmlFor="dni"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1"
          >
            DNI
            <span className="text-[9px] lowercase font-normal italic text-gray-400">
              (No modificable)
            </span>
          </label>
          <input
            type="text"
            id="dni"
            value={dni}
            readOnly
            className="block w-full bg-gray-100 border border-gray-200 text-gray-500 text-xs font-mono rounded-xl p-3 cursor-not-allowed select-none"
          />
        </div>

        {/* Campo: Teléfono */}
        <div className="space-y-1">
          <label
            htmlFor="telefono"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1"
          >
            Teléfono (Opcional)
          </label>
          <input
            type="tel"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Campo: Correo */}
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1"
          >
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Cambiar Contraseña */}
        <div className="pt-2 border-t mt-4">
          <button
            type="button"
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 py-3 px-4 rounded-xl text-xs font-bold transition-all active:scale-[0.99] flex items-center justify-between cursor-pointer"
            onClick={() => navigate('/perfil/password')}
          >
            <div className="flex items-center gap-2 text-gray-600">
              <Lock size={14} strokeWidth={2.5} />
              <span>Modificar Contraseña</span>
            </div>
            <ChevronRight size={14} className="text-gray-400" strokeWidth={3} />
          </button>
        </div>

        {/* Guardar */}
        <div className="pt-2 space-y-2 shrink-0">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>

      {/* Footer Cancelar */}
      <div className="text-center pt-2 shrink-0">
        <button
          type="button"
          className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          onClick={() => navigate('/perfil')}
        >
          Descartar cambios y volver
        </button>
      </div>
    </div>
  );
}
