import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { api } from '../../services/api';

export default function Perfil() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      setLoadingProfile(true);
      api.getUsuario(user.id)
        .then((freshUser) => {
          updateUser(freshUser);
          setLoadingProfile(false);
        })
        .catch((err) => {
          console.error('Error fetching user profile:', err);
          setLoadingProfile(false);
        });
    }
  }, []);

  if (!user) return null;

  if (loadingProfile && !user.DNI && !user.telefono) {
    const isAdmin = user.rol === 'administrador';
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className={`w-8 h-8 border-4 ${isAdmin ? 'border-purple-500 border-t-transparent' : 'border-blue-600 border-t-transparent'} rounded-full animate-spin`}></div>
        <p className="text-xs font-bold text-gray-400">Cargando perfil...</p>
      </div>
    );
  }

  const isClient = user.rol === 'cliente';
  const isOperator = user.rol === 'operador';
  const isAdmin = user.rol === 'administrador';

  const getRoleSubtitle = () => {
    if (isClient) return 'Cliente Registrado LavaPro';
    if (isOperator) return 'Operador de Planta de Lavado';
    return 'Administrador General';
  };

  const profile = {
    nombre: user.nombre || '',
    apellido: '',
    dni: user.DNI || '',
    telefono: user.telefono || '',
    email: user.email || '',
    qrData: user.codigo_qr || `LAVAPRO-USR-${user.id}-${user.DNI || ''}`,
    subtitle: getRoleSubtitle()
  };
  const badgeColor = isAdmin 
    ? 'bg-purple-50 text-purple-600 border-purple-100' 
    : isOperator 
      ? 'bg-amber-50 text-amber-700 border-amber-100' 
      : 'bg-blue-50 text-blue-600 border-blue-100';

  return (
    <div className="flex-1 flex flex-col justify-start space-y-5 overflow-y-auto pr-1">
      {/* Tarjeta del Código QR (Solo para Cliente) */}
      {isClient ? (
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 text-center text-white shadow-md flex flex-col items-center justify-center space-y-2.5 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">
            Tu QR de Retiro y Entrega
          </p>

          <div className="bg-white p-2.5 rounded-xl shadow-inner inline-block">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${profile.qrData}&bgcolor=ffffff&qzone=4`}
              alt="QR Usuario"
              className="w-28 h-28 mx-auto"
            />
          </div>

          <div className="text-center">
            <h3 className="text-base font-black tracking-tight">
              {profile.nombre} {profile.apellido}
            </h3>
            <p className="text-[11px] text-blue-100 font-medium opacity-90">
              {profile.subtitle}
            </p>
          </div>
        </div>
      ) : (
        /* Tarjeta de Encabezado Simple para Staff */
        <div className="bg-gradient-to-br from-gray-800 to-gray-950 rounded-2xl p-4 text-center text-white shadow-md flex flex-col items-center justify-center space-y-2 shrink-0">
          <span className={`text-[9px] border px-2 py-0.5 rounded-md font-black uppercase tracking-wide ${badgeColor}`}>
            {user.rol}
          </span>
          <div className="text-center">
            <h3 className="text-base font-black tracking-tight">
              {profile.nombre} {profile.apellido}
            </h3>
            <p className="text-[11px] text-gray-300 font-medium opacity-90">
              {profile.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Sección de Campos */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
          Información de la Cuenta
        </h4>

        <div className="bg-white border rounded-xl p-3.5 space-y-3 shadow-sm text-xs font-semibold text-gray-800">
          <div className="flex justify-between items-center border-b pb-2.5">
            <span className="text-gray-400 font-medium">Nombre Completo</span>
            <span className="text-gray-900">{profile.nombre} {profile.apellido}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2.5">
            <span className="text-gray-400 font-medium">Documento (DNI)</span>
            <span className="text-gray-900 font-mono">{profile.dni}</span>
          </div>

          <div className="flex justify-between items-center border-b pb-2.5">
            <span className="text-gray-400 font-medium">Teléfono de Contacto</span>
            <span className="text-gray-900">{profile.telefono}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Correo Electrónico</span>
            <span className="text-gray-900">{profile.email}</span>
          </div>
        </div>
      </div>

      {/* Acción de Edición */}
      <div className="pt-1">
        <Button
          onClick={() => navigate('/perfil/editar')}
          variant="primary"
        >
          Editar Datos del Perfil
        </Button>
      </div>
    </div>
  );
}
