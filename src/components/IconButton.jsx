import React from "react";

export default function IconButton({ children, onClick, title, className = "" }) {
  return (
    <button
      type="button"
      className={`icon-btn ${className}`.trim()}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}
