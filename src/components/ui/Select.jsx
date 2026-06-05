
export default function Select({
  label,
  id,
  value,
  onChange,
  required = false,
  options = [],
  placeholder = 'Selecciona una opción...',
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 block"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className="block w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl p-3.5 appearance-none focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm cursor-pointer"
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
