import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./appRoutes";
import "./index.css";
//import "./postcss.config";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);
