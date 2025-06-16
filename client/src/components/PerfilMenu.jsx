// src/components/PerfilMenu.jsx
import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  Avatar,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutButton from "./LogoutButton"; // ya lo creamos antes
import { useNavigate } from "react-router-dom";

const PerfilMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Obtenemos datos guardados en localStorage
  const nombres = localStorage.getItem("nombres_usuario");
  const email = localStorage.getItem("email_usuario");

  return (
    <>
      {/* Icono para abrir el menú del perfil */}
      <IconButton color="inherit" onClick={handleOpen}>
        <AccountCircleIcon fontSize="large" />
      </IconButton>

      {/* Menú desplegable */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {/* Datos del usuario */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {nombres}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {email}
          </Typography>
        </Box>

        <Divider />

        {/* Acciones */}
        <MenuItem
          onClick={() => {
            navigate("/Actualizar-Datos");
            handleClose();
          }}
        >
          Actualizar datos
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate("/historial-transacciones");
            handleClose();
          }}
        >
          Ver historial transacciones
        </MenuItem>

        <Divider />

        <MenuItem>
          <LogoutButton />
        </MenuItem>
      </Menu>
    </>
  );
};

export default PerfilMenu;
