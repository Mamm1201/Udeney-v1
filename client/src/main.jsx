import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./appRoutes";
import { CarritoProvider } from "./context/CarritoContext";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CarritoProvider>
        <AppRoutes />
      </CarritoProvider>
    </ThemeProvider>
  </React.StrictMode>
);
