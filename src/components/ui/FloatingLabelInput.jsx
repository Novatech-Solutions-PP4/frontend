
export default function FloatingLabelInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  required = false,
  className = '',
  rightElement,
  ...props
}) {
  return (
    <div className={`relative border-b-2 border-gray-200 focus-within:border-blue-600 transition-colors duration-200 ${className}`}>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        className="block w-full px-0 py-2.5 bg-transparent text-gray-900 focus:outline-none text-sm floating-input pr-8"
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute text-sm text-gray-400 duration-200 top-2.5 z-10 origin-[0] transform pointer-events-none font-medium transition-all floating-label"
      >
        {label}
      </label>
      {rightElement && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-1">
          {rightElement}
        </div>
      )}
    </div>
  );
}
