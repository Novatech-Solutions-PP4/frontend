import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';


export default function DetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const ticketRef = useRef(null);

  const fetchOrder = () => {
    setLoading(true);
    api.getPedidoById(id)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    const isAdmin = user?.rol === 'administrador';
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className={`w-8 h-8 border-4 ${isAdmin ? 'border-purple-500 border-t-transparent' : 'border-blue-600 border-t-transparent'} rounded-full animate-spin`}></div>
        <p className="text-xs font-bold text-gray-400">Cargando detalles del pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Pedido no encontrado</h3>
        <p className="text-xs text-gray-400">El pedido con ID #{id} no existe en el sistema.</p>
        <Button onClick={() => navigate('/pedidos')} variant="secondary">
          Volver a Pedidos
        </Button>
      </div>
    );
  }

  const isClient = user?.rol === 'cliente';
  const isPaid = order.paymentStatus === 'Pagado';

  let nextStatus = '';
  if (order.status === 'Ingresado') nextStatus = 'En proceso';
  else if (order.status === 'En proceso') nextStatus = 'Listo';
  else if (order.status === 'Listo') nextStatus = 'Entregado';

  const handlePay = () => {
    if (order.checkoutUrl) {
      window.open(order.checkoutUrl, '_blank');
    } else {
      addToast('No se pudo encontrar el enlace de pago de Mercado Pago. Intente refrescar la orden.', 'warning');
    }
  };

  const handleDownloadTicket = () => {
    if (!ticketRef.current) return;
    
    addToast('Generando comprobante de pago PDF...', 'success');
    
    const options = {
      margin: 10,
      filename: `Comprobante_Pago_Pedido_${order.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(options).from(ticketRef.current).save()
      .then(() => {
        addToast('Comprobante descargado correctamente.', 'success');
      })
      .catch((err) => {
        console.error('Error generating PDF:', err);
        addToast('Error al generar el comprobante PDF.', 'warning');
      });
  };

  const handleBajaLogica = async () => {
    const confirmed = await confirm({
      title: '¿Desea dar de baja esta orden?',
      message: 'Esto aplicará una baja lógica en el backend sin romper relaciones históricas.',
      type: 'danger',
      confirmLabel: 'Dar de Baja',
      cancelLabel: 'Cancelar'
    });

    if (confirmed) {
      api.deletePedido(order.id).then(() => {
        addToast(`Orden #${order.id} deshabilitada correctamente.`, 'success');
        navigate('/pedidos');
      });
    }
  };

  const handleAdvanceStatus = async () => {
    if (!nextStatus) return;

    const confirmed = await confirm({
      title: 'Avanzar trazabilidad del pedido',
      message: `¿Desea avanzar el estado del pedido #${order.id} a "${nextStatus}"?`,
      type: 'info',
      confirmLabel: 'Avanzar Estado',
      cancelLabel: 'Cancelar'
    });

    if (confirmed) {
      api.updatePedido(order.id, { status: nextStatus }).then(() => {
        addToast(`Estado del pedido actualizado a "${nextStatus}" con éxito.`, 'success');
        fetchOrder();
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start space-y-4 overflow-y-auto pr-1">
      {/* Barra de navegación interna / Título */}
      <div className="flex items-center gap-2 text-gray-800 shrink-0">
        <button
          onClick={() => navigate('/pedidos')}
          className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
          aria-label="Volver a la lista de pedidos"
        >
          <ArrowLeft size={16} strokeWidth={3} />
        </button>
        <h3 className="text-base font-black tracking-tight">Pedido #{order.id}</h3>
      </div>

      {/* Card de Estados Principales */}
      <div className="bg-gray-50 border rounded-xl p-3.5 space-y-3 shadow-sm shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">
              {isClient ? 'Fecha de Ingreso' : 'Orden de Planta'}
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {isClient ? order.date : `Pedido #${order.id}`}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
          </div>
        </div>

        {/* Info de Titular (Staff only) */}
        {!isClient && (
          <div className="border-t pt-2 flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Cliente Titular:</span>
            <span className="font-extrabold text-gray-900 bg-white border px-2 py-0.5 rounded-md shadow-sm">
              {order.cliente}
            </span>
          </div>
        )}

        {/* Botones de Gestión (Staff only) */}
        {!isClient && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => navigate(`/pedidos/${order.id}/editar`)}
              className="flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl font-bold text-[11px] shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Edit2 size={13} strokeWidth={2.5} />
              Editar Pedido
            </button>
            <button
              onClick={handleBajaLogica}
              className="flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl font-bold text-[11px] shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 size={13} strokeWidth={2.5} />
              Dar de Baja
            </button>
          </div>
        )}
      </div>

      {/* Sección: Servicios Contratados */}
      <div className="space-y-1.5 shrink-0">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1">
          {isClient ? 'Servicios Contratados' : 'Servicios en esta Orden'}
        </h4>
        <div className="bg-white border rounded-xl p-3.5 space-y-3 shadow-sm">
          {order.services && order.services.map((service, index) => {
            const isLast = index === order.services.length - 1;
            return (
              <div
                key={index}
                className={`flex justify-between items-center text-xs ${!isLast ? 'border-b pb-2.5' : ''}`}
              >
                <span className="text-gray-800 font-bold">{service.name}</span>
                <span className="font-extrabold text-gray-900">
                  ${service.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de Trazabilidad (Timeline) */}
      {order.trazabilidad && (
        <div className="space-y-1.5 shrink-0">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1">
            Historial de Trazabilidad
          </h4>
          <div className="bg-white border rounded-xl p-4 shadow-sm relative">
            <div className="absolute left-[21px] top-6 bottom-6 w-[2px] bg-gray-100"></div>
            {order.trazabilidad.map((item, index) => {
              const isLast = index === order.trazabilidad.length - 1;
              return (
                <div key={index} className={`flex items-start gap-4 relative ${!isLast ? 'pb-4' : ''}`}>
                  <div className={`w-3 h-3 rounded-full border-2 border-white ring-4 ring-gray-100 mt-1 z-10 shrink-0 ${item.color}`}></div>
                  <div className="text-xs">
                    <p className={`font-black ${isLast ? 'text-green-600' : 'text-gray-700'}`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {item.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sección Facturación / Pago / Escaneo QR */}
      <div className="shrink-0 pt-2 pb-4">
        {isClient ? (
          isPaid ? (
            <div className="space-y-2">
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 space-y-2 text-xs shadow-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Método de Pago</span>
                  <span className="font-bold text-emerald-700">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b border-emerald-100 pb-2">
                  <span>Fecha de Pago</span>
                  <span className="text-gray-700 font-medium">{order.paymentDate}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
                  <span>ABONADO TOTAL</span>
                  <span className="text-emerald-600">
                    ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Button onClick={handleDownloadTicket} variant="secondary">
                Descargar Ticket PDF
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border rounded-xl p-3.5 space-y-2 text-xs shadow-sm">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Costo Neto Subtotal</span>
                  <span>${order.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium border-b pb-2">
                  <span>Impuestos (IVA 21%)</span>
                  <span>${order.tax.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
                  <span>TOTAL A PAGAR</span>
                  <span className="text-blue-600">
                    ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Button onClick={handlePay} variant="blue">
                Pagar Pedido
              </Button>
            </div>
          )
        ) : nextStatus ? (
          /* Botón para avanzar estado logístico (Staff only) */
          <Button onClick={handleAdvanceStatus} variant="primary">
            Avanzar Estado a "{nextStatus}"
          </Button>
        ) : (
          <div className="text-center text-xs font-bold text-gray-400 p-3.5 border border-dashed rounded-xl bg-gray-50 select-none">
            {order.status === 'Cancelado' ? 'Pedido Cancelado' : 'Pedido Completado y Entregado'}
          </div>
        )}
      </div>
      {/* Contenedor oculto para la generación directa de comprobante PDF sin términos y condiciones */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', overflow: 'hidden' }}>
        <div 
          ref={ticketRef} 
          style={{
            width: '650px',
            padding: '30px',
            backgroundColor: '#ffffff',
            color: '#1f2937',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '11px',
            lineHeight: '1.5',
            boxSizing: 'border-box'
          }}
        >
          {/* Header Comercial Argentino */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #374151', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1, paddingRight: '15px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 4px 0', letterSpacing: '-0.025em', color: '#2563eb' }}>LAVAPRO APP</h1>
              <p style={{ margin: '3px 0', fontWeight: 'bold' }}>LavaPro S.R.L.</p>
              <p style={{ margin: '3px 0', color: '#4b5563' }}>Servicio Profesional de Lavandería</p>
              <p style={{ margin: '3px 0', color: '#4b5563' }}>Av. Corrientes 1234, C.A.B.A.</p>
              <p style={{ margin: '3px 0', color: '#4b5563' }}>Buenos Aires, Argentina</p>
              <p style={{ margin: '3px 0', color: '#4b5563' }}>IVA Responsable Inscripto</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '80px', borderLeft: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', margin: '0 10px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '32px', fontWeight: '900', border: '2px solid #374151', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justify: 'center', marginBottom: '4px', color: '#111827', backgroundColor: '#f9fafb' }}>X</div>
              <div style={{ fontSize: '8px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase' }}>CONFORMIDAD</div>
            </div>

            <div style={{ flex: 1, paddingLeft: '15px', textAlign: 'right' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 8px 0', textTransform: 'uppercase', color: '#111827' }}>Comprobante</h2>
              <p style={{ fontSize: '8px', fontWeight: 'bold', color: '#dc2626', margin: '3px 0' }}>DOCUMENTO NO VÁLIDO COMO FACTURA</p>
              <p style={{ margin: '3px 0', color: '#4b5563' }}><strong>Nº de Control:</strong> 0001-{order.id.padStart(8, '0')}</p>
              <p style={{ margin: '3px 0', color: '#4b5563' }}><strong>Fecha Recepción:</strong> {order.date}</p>
              <p style={{ margin: '3px 0', color: '#4b5563' }}><strong>CUIT:</strong> 30-71428596-3</p>
              <p style={{ margin: '3px 0', color: '#4b5563' }}><strong>Ingresos Brutos:</strong> 30-71428596-3</p>
              <p style={{ margin: '3px 0', color: '#4b5563' }}><strong>Inicio Actividades:</strong> 01/03/2025</p>
            </div>
          </div>

          {/* Datos del Cliente */}
          <div style={{ fontWeight: '800', textTransform: 'uppercase', backgroundColor: '#f3f4f6', padding: '5px 10px', marginBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '10px', color: '#374151', letterSpacing: '0.05em' }}>Datos del Cliente</div>
          <div style={{ display: 'grid', gridTemplateCols: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Señor(a):</strong> {order.cliente}</p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>DNI/CUIT:</strong> {order.clienteDni}</p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Condición IVA:</strong> Consumidor Final</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Teléfono:</strong> {order.clienteTelefono}</p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Email:</strong> {order.clienteEmail}</p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}><strong>Forma de Pago:</strong> {order.paymentMethod || 'Mercado Pago'}</p>
            </div>
          </div>

          {/* Detalle de Servicios */}
          <div style={{ fontWeight: '800', textTransform: 'uppercase', backgroundColor: '#f3f4f6', padding: '5px 10px', marginBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '10px', color: '#374151', letterSpacing: '0.05em' }}>Detalle del Servicio</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #e5e7eb', padding: '8px 10px', textAlign: 'center', backgroundColor: '#f9fafb', fontWeight: '700', color: '#374151', width: '10%' }}>Cant.</th>
                <th style={{ border: '1px solid #e5e7eb', padding: '8px 10px', textAlign: 'left', backgroundColor: '#f9fafb', fontWeight: '700', color: '#374151' }}>Detalle del Servicio</th>
                <th style={{ border: '1px solid #e5e7eb', padding: '8px 10px', textAlign: 'right', backgroundColor: '#f9fafb', fontWeight: '700', color: '#374151', width: '25%' }}>Precio Unitario</th>
                <th style={{ border: '1px solid #e5e7eb', padding: '8px 10px', textAlign: 'right', backgroundColor: '#f9fafb', fontWeight: '700', color: '#374151', width: '25%' }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {order.services && order.services.map((service, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 10px', textAlign: 'center' }}>1</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 10px', textAlign: 'left' }}>{service.name}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 10px', textAlign: 'right' }}>${service.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  <td style={{ border: '1px solid #e5e7eb', padding: '8px 10px', textAlign: 'right' }}>${service.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Desglose de Totales e IVA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', marginBottom: '5px', fontSize: '11px', color: '#4b5563' }}>
              <span>Subtotal Neto (21.00%):</span>
              <span>${order.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', marginBottom: '5px', fontSize: '11px', color: '#4b5563' }}>
              <span>IVA Inscripto (21.00%):</span>
              <span>${order.tax.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', marginBottom: '5px', borderTop: '2px double #374151', paddingTop: '6px', fontWeight: '800', fontSize: '13px', color: '#111827' }}>
              <span>TOTAL ABONADO:</span>
              <span>${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <div style={{ border: '1.5px solid #10b981', color: '#047857', backgroundColor: '#ecfdf5', padding: '6px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '11px', display: 'inline-block', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>COMPROBANTE PAGADO</div>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #d1d5db', margin: '16px 0' }}></div>

          {/* Sección QR del Pedido */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0 16px 0', textAlign: 'center' }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LAVAPRO-PED-${order.id}&bgcolor=ffffff&qzone=2`} 
              alt={`QR Pedido #${order.id}`} 
              style={{ width: '110px', height: '110px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px', backgroundColor: '#ffffff', marginBottom: '6px' }} 
            />
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#111827', letterSpacing: '0.025em' }}>CÓDIGO DE RETIRO: LAVAPRO-PED-{order.id}</div>
            <div style={{ fontSize: '8px', fontWeight: 'normal', color: '#4b5563', marginTop: '2px' }}>
              Presente este código QR o su credencial para retirar sus prendas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
