import React, { useState } from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const LogoutButton = ({
  variant = "text",
  size = "medium",
  label = "Cerrar sesión",
}) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setOpenSnackbar(true);
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <>
      <Button
        onClick={handleLogout}
        color="inherit"
        startIcon={<LogoutIcon />}
        variant={variant}
        size={size}
      >
        {label}
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setOpenSnackbar(false)}
        >
          ¡Sesión cerrada correctamente!
        </Alert>
      </Snackbar>
    </>
  );
};

export default LogoutButton;
