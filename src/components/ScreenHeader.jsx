import React from "react";
import { Link } from "react-router-dom";

export default function ScreenHeader({ title, backTo, right }) {
  return (
    <div className="screen-header">
      <div className="screen-header-inner">
        {backTo ? (
          <Link to={backTo} className="screen-back" aria-label="Volver">
            ←
          </Link>
        ) : (
          <span className="screen-back-spacer" />
        )}
        <h1 className="screen-title">{title}</h1>
        <div className="screen-header-right">{right ?? <span className="screen-back-spacer" />}</div>
      </div>
      <div className="screen-header-line" />
    </div>
  );
}
