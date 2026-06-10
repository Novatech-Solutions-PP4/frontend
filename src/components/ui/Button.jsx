
export default function Button({
  children,
  type = 'submit',
  variant = 'primary',
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.99] cursor-pointer text-center flex items-center justify-center gap-1.5';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-900',
    secondary: 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm py-3 text-xs',
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      className={`${baseStyles} ${selectedVariant} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
