import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Avatar,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "info" });

    try {
      const response = await loginUser({
        email: form.email,
        password: form.password,
      });

      const {
        access_token,
        refresh_token,
        message,
        id_usuario,
        email,
        nombres_usuario,
      } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("email_usuario", email);
      localStorage.setItem("id_usuario", id_usuario);
      localStorage.setItem("nombres_usuario", nombres_usuario);

      setSnackbar({
        open: true,
        message: message || "Inicio de sesión exitoso",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Error al iniciar sesión. Intenta de nuevo.";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={6} sx={{ padding: 4, mt: 8, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <LockOutlined />
          </Avatar>

          <Typography component="h1" variant="h5">
            Iniciar Sesión
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 1 }}
          >
            Ingresa tus credenciales para continuar
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              name="email"
              label="Correo electrónico"
              fullWidth
              variant="outlined"
              required
              value={form.email}
              onChange={handleChange}
            />
            <TextField
              name="password"
              label="Contraseña"
              fullWidth
              variant="outlined"
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      aria-label="Mostrar u ocultar contraseña"
                      title="Mostrar u ocultar contraseña"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 1,
                borderRadius: "12px",
                fontWeight: "bold",
                textTransform: "none",
                py: 1.5,
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Ingresar"}
            </Button>
          </Box>

          {/* Botón de redirección a registro */}
          <Typography variant="body2" sx={{ mt: 2 }}>
            ¿No tienes una cuenta?{" "}
            <Button
              variant="text"
              size="small"
              onClick={() => navigate("/registro")}
              sx={{ textTransform: "none", padding: 0, minWidth: 0 }}
            >
              Regístrate
            </Button>
          </Typography>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
