import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';
import Button from '../../components/ui/Button';

export default function OlvideContrasena() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Por favor ingrese su correo electrónico.', 'warning');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast('Por favor ingrese un correo electrónico válido.', 'warning');
      return;
    }
    setLoading(true);
    api.forgotPassword(email)
      .then(() => {
        addToast('Enlace de recuperación enviado. Por favor, revisá tu casilla de correo.', 'success');
        navigate('/login');
      })
      .catch((err) => {
        addToast(err.message || 'Error al enviar el enlace de recuperación.', 'warning');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full min-h-[500px]">
      {/* Branding Superior */}
      <div className="text-center mt-6 shrink-0">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          LavaPro
        </h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          Recuperación de credenciales
        </p>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full opacity-60"></div>
      </div>

      {/* Formulario Central */}
      <div className="flex-1 flex flex-col justify-center my-8 shrink-0">
        <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="text-xs text-gray-400 text-center mb-6 leading-relaxed px-4">
          Ingresá el correo electrónico asociado a tu cuenta. Te enviaremos un
          enlace seguro para que puedas restablecerla.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <FloatingLabelInput
            label="Correo electrónico"
            id="forgot_email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </Button>
          </div>
        </form>
      </div>

      {/* Footer Branding y Retorno */}
      <div className="text-center mb-4 space-y-4 shrink-0">
        <div>
          <button
            type="button"
            className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Volver al inicio de sesión
          </button>
        </div>
        <p className="text-[10px] text-gray-400 font-bold tracking-widest">
          LAVAPRO • SEGURIDAD
        </p>
      </div>
    </div>
  );
}
