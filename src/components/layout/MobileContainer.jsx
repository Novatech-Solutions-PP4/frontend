
export default function MobileContainer({ children, className = "", padding = "p-6" }) {
  return (
    <div
      className={`w-full h-dvh bg-white flex flex-col justify-between ${padding} mx-auto relative overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
