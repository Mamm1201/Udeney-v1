import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Link,
} from "@mui/material";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    console.log({ email, password, role });

    if (email && password && role) {
      if (role === "vendedor") {
        navigate("/crear-articulo");
      } else if (role === "comprador") {
        navigate("/articulos");
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
      />

      <TextField
        type="password"
        label="Contraseña"
        autoComplete="current-password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Seleccionar Rol</InputLabel>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          variant="outlined"
        >
          <MenuItem value="vendedor">Vendedor</MenuItem>
          <MenuItem value="comprador">Comprador</MenuItem>
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        style={{ marginTop: "10px" }}
      >
        Iniciar Sesión
      </Button>

      {/* Mensaje para redirigir al usuario al registro */}
      <Typography variant="body2" style={{ marginTop: "15px" }}>
        ¿Aún no tienes cuenta?{" "}
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate("/registro")}
          style={{ fontWeight: "bold" }}
        >
          Regístrate aquí
        </Link>
      </Typography>
    </form>
  );
};

export default LoginForm;
