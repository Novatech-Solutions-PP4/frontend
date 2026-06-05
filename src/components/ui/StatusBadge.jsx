
export default function StatusBadge({ status, type = 'badge' }) {
  const normalized = status.toLowerCase().trim();

  if (type === 'dot') {
    const dotColors = {
      'ingresado': 'bg-amber-500',
      'en proceso': 'bg-blue-500 animate-pulse',
      'listo': 'bg-emerald-500',
      'entregado': 'bg-gray-400',
    };
    const colorClass = dotColors[normalized] || 'bg-gray-400';
    return <span className={`w-3.5 h-3.5 rounded-full block shrink-0 ${colorClass}`}></span>;
  }

  const badgeStyles = {
    // Proceso Pedido
    'ingresado': 'bg-amber-100 text-amber-800 border-amber-200',
    'en proceso': 'bg-blue-50 text-blue-600 border-blue-100',
    'listo': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'entregado': 'bg-gray-100 text-gray-600 border-gray-200',
    
    // Pago
    'deuda': 'bg-red-50 text-red-600 border-red-100',
    'pendiente de pago': 'bg-red-50 text-red-600 border-red-100',
    'pagado': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'procesando pago': 'bg-blue-50 text-blue-600 border-blue-100',
    
    // Soporte / Reclamos
    'en revisión': 'bg-blue-50 text-blue-600 border-blue-100',
    'resuelto': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  const styleClass = badgeStyles[normalized] || 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider border ${styleClass} flex items-center justify-center gap-1`}>
      {(normalized === 'en revisión' || normalized === 'procesando pago') && (
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full block animate-pulse"></span>
      )}
      {status}
    </span>
  );
}
