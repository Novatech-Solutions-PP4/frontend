
export default function MobileContainer({ children, className = "", padding = "p-6" }) {
  return (
    <div
      className={`w-full h-screen sm:h-[780px] md:h-screen bg-white flex flex-col justify-between ${padding} max-w-sm md:max-w-none mx-auto sm:shadow-2xl md:shadow-none sm:rounded-2xl md:rounded-none border border-gray-100 md:border-none relative overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
