
export default function MobileContainer({ children, className = "", padding = "p-6" }) {
  return (
    <div
      className={`w-full h-screen sm:h-[780px] bg-white flex flex-col justify-between ${padding} max-w-sm mx-auto sm:shadow-2xl sm:rounded-2xl border border-gray-100 relative overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
