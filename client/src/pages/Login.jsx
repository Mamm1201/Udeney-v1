// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   TextField,
//   Button,
//   Select,
//   MenuItem,
//   InputLabel,
//   FormControl,
//   Typography,
//   Link,
// } from "@mui/material";

// const API_URL = "http://127.0.0.1:8000/api/token/"; // Ajusta la URL según tu backend

// const LoginForm = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!email || !password || !role) {
//       setError("Por favor, completa todos los campos.");
//       return;
//     }

//     try {
//       const response = await axios.post(API_URL, {
//         username: email, // Django usa "username" en lugar de "email"
//         password: password,
//       });

//       localStorage.setItem("accessToken", response.data.access);
//       localStorage.setItem("refreshToken", response.data.refresh);

//       // Redirige según el rol seleccionado
//       if (role === "vendedor") {
//         navigate("/crear-articulo");
//       } else if (role === "comprador") {
//         navigate("/articulos");
//       }
//     } catch (error) {
//       console.error("Error en la autenticación:", error);
//       setError(error.response?.data?.detail || "Error en el inicio de sesión.");
//     }
//   };

//   return (
//     <form
//       onSubmit={handleLogin}
//       style={{
//         width: "350px",
//         margin: "auto",
//         padding: "25px",
//         textAlign: "center",
//         borderRadius: "10px",
//         boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
//         backgroundColor: "#fff",
//       }}
//     >
//       <h2>Iniciar Sesión</h2>

//       {error && <Typography color="error">{error}</Typography>}

//       <TextField
//         label="Correo Electrónico"
//         type="email"
//         autoComplete="email"
//         variant="outlined"
//         fullWidth
//         margin="normal"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <TextField
//         type="password"
//         label="Contraseña"
//         autoComplete="current-password"
//         variant="outlined"
//         fullWidth
//         margin="normal"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />

//       <FormControl fullWidth margin="normal">
//         <InputLabel>Seleccionar Rol</InputLabel>
//         <Select
//           value={role}
//           onChange={(e) => setRole(e.target.value)}
//           variant="outlined"
//         >
//           <MenuItem value="vendedor">Vendedor</MenuItem>
//           <MenuItem value="comprador">Comprador</MenuItem>
//         </Select>
//       </FormControl>

//       <Button
//         type="submit"
//         variant="contained"
//         color="primary"
//         fullWidth
//         style={{ marginTop: "10px" }}
//       >
//         Iniciar Sesión
//       </Button>

//       {/* Mensaje para redirigir al usuario al registro */}
//       <Typography variant="body2" style={{ marginTop: "15px" }}>
//         ¿Aún no tienes cuenta?{" "}
//         <Link
//           component="button"
//           variant="body2"
//           onClick={() => navigate("/registro")}
//           style={{ fontWeight: "bold" }}
//         >
//           Regístrate aquí
//         </Link>
//       </Typography>
//     </form>
//   );
// };

// export default LoginForm;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

const API_URL = "http://127.0.0.1:8000/api/token/"; // Ajusta la URL según tu backend

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      navigate("/articulos"); // Redirige si ya está autenticado
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        username: email, // Django espera "username" en lugar de "email"
        password: password,
      });

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      navigate("/articulos");
    } catch (error) {
      console.error("Error en la autenticación:", error);
      setError(error.response?.data?.detail || "Error en el inicio de sesión.");
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

      {error && <Typography color="error">{error}</Typography>}

      <TextField
        label="Correo Electrónico"
        type="email"
        autoComplete="email"
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

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        style={{ marginTop: "10px" }}
      >
        Iniciar Sesión
      </Button>

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
