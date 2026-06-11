import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

export default function CambiarPassword() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast('Por favor ingrese su contraseña actual.', 'warning');
      return;
    }
    if (!newPassword) {
      addToast('Por favor ingrese su nueva contraseña.', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      addToast('La nueva contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Las contraseñas nuevas no coinciden.', 'warning');
      return;
    }
    addToast(
      'Actualizando contraseña...',
      'success'
    );
    navigate('/perfil/editar');
  };

  return (
    <div className="flex-1 flex flex-col justify-start space-y-5 overflow-y-auto pr-1">
      {/* HEADER SUPERIOR INTERNO */}
      <div className="flex justify-between items-center border-b pb-3 mb-2 shrink-0">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            LavaPro App
          </p>
          <h2 className="text-md font-bold text-gray-800">Seguridad</h2>
        </div>
        <button
          onClick={() => navigate('/perfil/editar')}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
          aria-label="Volver a configuración"
        >
          <ArrowLeft size={18} strokeWidth={3} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-gray-800 shrink-0">
        <h3 className="text-base font-black tracking-tight">Modificar Contraseña</h3>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed pl-1 shrink-0">
        Para proteger tu cuenta, ingresá tu clave actual seguida de la nueva
        combinación que deseas utilizar.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2 flex-1">
        {/* Contraseña Actual */}
        <div className="space-y-1">
          <label
            htmlFor="current_password"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1"
          >
            Contraseña Actual
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              id="current_password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3.5 pr-10 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Nueva Contraseña */}
        <div className="space-y-1">
          <label
            htmlFor="new_password"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1"
          >
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              id="new_password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Mínimo 8 caracteres"
              className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3.5 pr-10 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirmar Nueva Contraseña */}
        <div className="space-y-1">
          <label
            htmlFor="confirm_password"
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1"
          >
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              id="confirm_password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repetí tu nueva clave"
              className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3.5 pr-10 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="pt-4 space-y-2">
          <Button type="submit" variant="primary">
            Actualizar Contraseña
          </Button>
        </div>
      </form>

      {/* Footer Cancelar */}
      <div className="text-center pt-2 shrink-0">
        <button
          type="button"
          className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          onClick={() => navigate('/perfil/editar')}
        >
          Cancelar y volver
        </button>
      </div>
    </div>
  );
}
