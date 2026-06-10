import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { HelpCircle, AlertTriangle, Info } from 'lucide-react';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialog({
        title: options.title || '¿Estás seguro?',
        message: options.message || '',
        type: options.type || 'info',
        isPrompt: options.isPrompt || false,
        placeholder: options.placeholder || '',
        defaultValue: options.defaultValue || '',
        inputType: options.inputType || 'text',
        confirmLabel: options.confirmLabel || 'Aceptar',
        cancelLabel: options.cancelLabel || 'Cancelar',
        resolve,
      });
      setInputValue(options.defaultValue || '');
    });
  }, []);

  const handleConfirm = () => {
    if (dialog) {
      if (dialog.isPrompt) {
        dialog.resolve(inputValue);
      } else {
        dialog.resolve(true);
      }
      setDialog(null);
    }
  };

  const handleCancel = () => {
    if (dialog) {
      dialog.resolve(dialog.isPrompt ? null : false);
      setDialog(null);
    }
  };

  useEffect(() => {
    if (dialog && dialog.isPrompt && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [dialog]);

  let icon = <HelpCircle className="text-blue-500" size={32} />;
  let colorClass = 'border-blue-500 focus:border-blue-500';

  if (dialog) {
    if (dialog.type === 'danger') {
      icon = <AlertTriangle className="text-red-600 animate-bounce" size={32} />;
      colorClass = 'border-red-500 focus:border-red-500';
    } else if (dialog.type === 'warning') {
      icon = <AlertTriangle className="text-amber-500" size={32} />;
      colorClass = 'border-amber-500 focus:border-amber-500';
    } else {
      icon = <Info className="text-indigo-500" size={32} />;
      colorClass = 'border-indigo-500 focus:border-indigo-500';
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {dialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col relative animate-slide-down">
            <div className="p-5 flex flex-col items-center text-center border-b border-gray-100 bg-gray-50/50">
              <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                {icon}
              </div>
              <h3 className="font-black text-gray-800 text-sm tracking-tight leading-snug">
                {dialog.title}
              </h3>
            </div>

            <div className="px-6 py-5 flex flex-col space-y-4">
              {dialog.message && (
                <p className="text-xs text-gray-500 text-center font-medium leading-relaxed whitespace-pre-line">
                  {dialog.message}
                </p>
              )}

              {dialog.isPrompt && (
                <div className="w-full">
                  <input
                    ref={inputRef}
                    type={dialog.inputType}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={dialog.placeholder}
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:bg-white transition-all border-l-4 ${colorClass}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirm();
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-white hover:bg-gray-100 text-gray-500 border border-gray-200 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-[0.98] cursor-pointer"
              >
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`flex-1 text-white py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all active:scale-[0.98] cursor-pointer shadow-sm ${
                  dialog.type === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : dialog.type === 'warning'
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
