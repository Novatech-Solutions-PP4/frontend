import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LaundryDataProvider } from "./contexts/LaundryDataContext";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LaundryDataProvider>
        <App />
      </LaundryDataProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
