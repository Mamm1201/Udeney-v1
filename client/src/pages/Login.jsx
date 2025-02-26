import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Para la redirección
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate(); // Hook para redireccionar

  const handleLogin = (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario

    console.log({ email, password, role });

    // Simulación de autenticación
    if (email && password && role) {
      if (role === "vendedor") {
        navigate("/crear-articulo"); // Redirige si es vendedor
      } else if (role === "comprador") {
        navigate("/articulos"); // Redirige si es comprador a la sección de articulos
      }
    } else {
      alert("Por favor, completa todos los campos.");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      style={{
        width: "350px",
        margin: "auto",
        padding: "25px",
        textAlign: "center",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        backgroundColor: "#fff",
      }}
    >
      <h2>Iniciar Sesión</h2>

      <TextField
        label="Correo Electrónico"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        InputProps={{ style: { fontSize: "18px", padding: "14px" } }}
        InputLabelProps={{ style: { fontSize: "16px" } }}
      />

      <TextField
        type="password"
        label="Contraseña"
        name="password"
        autoComplete="current-password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel style={{ fontSize: "16px" }}>Seleccionar Rol</InputLabel>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          variant="outlined"
          style={{ fontSize: "18px", padding: "14px" }}
        >
          <MenuItem value="vendedor" style={{ fontSize: "16px" }}>
            Vendedor
          </MenuItem>
          <MenuItem value="comprador" style={{ fontSize: "16px" }}>
            Comprador
          </MenuItem>
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        style={{ fontSize: "18px", padding: "12px", marginTop: "10px" }}
      >
        Iniciar Sesión
      </Button>
    </form>
  );
};

export default LoginForm;
