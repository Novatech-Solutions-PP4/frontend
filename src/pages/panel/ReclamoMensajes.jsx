import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, BASE_URL } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import MessageBubble from '../../components/client/MessageBubble';
import StatusBadge from '../../components/ui/StatusBadge';

export default function ReclamoMensajes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const [claim, setClaim] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');

  const fetchClaimDetailsAndMessages = () => {
    if (!user) return;
    setLoading(true);
    
    // Fetch all claims to find the one matching the current ID
    Promise.all([
      api.getReclamos(user.rol, user.nombre),
      api.getReclamoMensajes(id)
    ])
      .then(([claims, msgs]) => {
        const found = claims.find(c => c.id === id) || {
          id: id || '000',
          pedidoId: 'Desconocido',
          status: 'En Revisión'
        };
        setClaim(found);
        setMessages(msgs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const [otherUserIsTyping, setOtherUserIsTyping] = useState(false);
  const [otherUserTypingName, setOtherUserTypingName] = useState('');

  const sendTypingStatus = (typing) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      if (isTypingRef.current !== typing) {
        isTypingRef.current = typing;
        socketRef.current.send(JSON.stringify({
          type: 'typing',
          is_typing: typing
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    sendTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 1500);
  };

  useEffect(() => {
    fetchClaimDetailsAndMessages();
    const token = localStorage.getItem('lavapro_token');
    if (!token) return;
    let ws;
    try {
      // Construcción dinámica de la URL del WebSocket basada en la API
      const apiHost = (BASE_URL || window.location.host).replace(/^https?:\/\//, '');
      const wsProto = (BASE_URL || '').startsWith('https') ? 'wss' : 'ws';
      ws = new WebSocket(`${wsProto}://${apiHost}/reclamos/${id}/ws?token=${token}`);
      socketRef.current = ws;
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
          } else if (data.type === 'typing') {
            if (data.is_typing) {
              setOtherUserTypingName(data.senderName);
              setOtherUserIsTyping(true);
            } else {
              setOtherUserIsTyping(false);
            }
          }
        } catch (err) {
          console.error('Error al decodificar mensaje de WebSocket:', err);
        }
      };
      ws.onclose = () => {
        console.log('Conexión de WebSocket cerrada.');
      };
    } catch (err) {
      console.error('No se pudo establecer la conexión de WebSocket del chat de forma segura:', err);
    }
    return () => {
      if (ws) {
        ws.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [id, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');
    sendTypingStatus(false);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'message',
        mensaje: textToSend
      }));
    } else {
      const isClient = user?.rol === 'cliente';
      const senderRole = isClient ? 'cliente' : 'soporte';
      api.addReclamoMensaje(id, senderRole, textToSend)
        .then((newMsg) => {
          setMessages((prev) => [...prev, newMsg]);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const handleStatusChange = (newStatus) => {
    api.updateReclamo(claim.id, newStatus).then(() => {
      addToast(`Estado del reclamo modificado a: ${newStatus}`, 'success');
      fetchClaimDetailsAndMessages();
    });
  };

  if (loading) {
    const isAdmin = user?.rol === 'administrador';
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
        <div className={`w-8 h-8 border-4 ${isAdmin ? 'border-purple-500 border-t-transparent' : 'border-blue-600 border-t-transparent'} rounded-full animate-spin`}></div>
        <p className="text-xs font-bold text-gray-400">Cargando chat de soporte...</p>
      </div>
    );
  }

  // Mapper de mensajes para MessageBubble
  const mappedMessages = messages.map(msg => {
    const isClient = msg.sender === 'cliente' || msg.sender === 'client';
    return {
      sender: isClient ? 'client' : 'support',
      senderName: msg.senderName || (isClient ? 'Cliente' : 'Soporte'),
      text: msg.text,
      timestamp: msg.time || msg.timestamp
    };
  });

  const isClient = user?.rol === 'cliente';

  return (
    <div className="flex-1 flex flex-col justify-between h-full bg-gray-50/50 relative overflow-hidden">
      {/* HEADER SUPERIOR CHAT */}
      <div className="bg-white border-b p-3.5 flex flex-col gap-2 shadow-sm shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/reclamos')}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
              aria-label="Volver a soporte"
            >
              <ArrowLeft size={18} strokeWidth={3} />
            </button>
            <div>
              <h3 className="font-black text-gray-800 text-sm">
                Soporte Reclamo #{claim.id}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {isClient ? `Pedido #${claim.pedidoId}` : `Cliente: ${claim.cliente || 'Ricardo Darín'} • Pedido #${claim.pedidoId}`}
              </p>
            </div>
          </div>
          {isClient && <StatusBadge status={claim.status} />}
        </div>

        {/* Selector de Estado de Reclamo Manual (Solo para staff) */}
        {!isClient && (
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 mt-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider pl-1 shrink-0">
              Estado Reclamo:
            </label>
            <select
              value={claim.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-bold text-gray-700 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
            >
              <option value="Abierto">Abierto</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Resuelto">Resuelto</option>
            </select>
          </div>
        )}
      </div>


      {/* ÁREA DE MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center my-2">
          <span className="bg-gray-200/60 text-gray-500 font-bold text-[9px] px-2 py-1 rounded-md uppercase tracking-wider">
            Reclamo activo
          </span>
        </div>

        {mappedMessages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}

        {otherUserIsTyping && (
          <div className="flex flex-col items-start space-y-1 max-w-[85%] mr-auto">
            <div className="bg-gray-100 border text-gray-500 rounded-2xl rounded-tl-none px-3 py-2 shadow-sm text-[10px] font-bold flex items-center gap-1.5">
              <span>{otherUserTypingName} está escribiendo</span>
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {claim && claim.status && claim.status.toLowerCase() === 'resuelto' ? (
        <div className="p-4 bg-gray-100 border-t text-center text-xs font-bold text-gray-500 shrink-0 z-10">
          El reclamo ha sido resuelto y el chat está cerrado.
        </div>
      ) : (
        /* BARRA DE ENTRADA INFERIOR */
        <form
          onSubmit={handleSend}
          noValidate
          className="p-3 bg-white border-t flex items-center gap-2 shrink-0 shadow-inner z-10"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Escribí tu mensaje acá..."
              className="w-full bg-gray-100 border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none rounded-xl pl-4 pr-10 py-3 text-xs font-medium text-gray-800 transition-all placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="p-3 bg-black text-white hover:bg-gray-900 rounded-xl transition-all active:scale-95 shadow cursor-pointer flex items-center justify-center"
            aria-label="Enviar mensaje"
          >
            <Send size={14} strokeWidth={3} />
          </button>
        </form>
      )}
    </div>
  );
}
