import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';
import Button from '../../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!password) {
      addToast('Por favor ingrese su contraseña.', 'warning');
      return;
    }
    api.login(email, password)
      .then((res) => {
        login(res.usuario, res.access_token);
        navigate('/dashboard');
      })
      .catch((err) => {
        addToast(err.message || 'Error al iniciar sesión', 'warning');
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
          Gestión inteligente y rápida de tus pedidos
        </p>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full opacity-60"></div>
      </div>

      {/* Formulario Central */}
      <div className="flex-1 flex flex-col justify-center my-8 shrink-0">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          Bienvenido
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <FloatingLabelInput
            label="Correo electrónico"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FloatingLabelInput
            label="Contraseña"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="text-right">
            <Link
              to="/recuperar-contrasena"
              className="text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors inline-block"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary">
              Ingresar
            </Button>
          </div>
        </form>
      </div>

      {/* Footer Branding */}
      <div className="text-center mb-4 shrink-0">
        <p className="text-[10px] text-gray-400 font-bold tracking-widest">
          LAVAPRO • SOFTWARE DE GESTIÓN
        </p>
      </div>
    </div>
  );
}
