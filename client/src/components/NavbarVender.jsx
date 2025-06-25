import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
  useTheme,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import Logo from "./Logo";
import LoginButton from "./Loginbutton";
import LogoutButton from "./LogoutButton";
import PerfilMenu from "./PerfilMenu";
import { useCarrito } from "../context/CarritoContext";

const Navbar = () => {
  const navigate = useNavigate();
  const nombre = localStorage.getItem("nombres_usuario");
  const isLoggedIn = !!localStorage.getItem("access_token");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const handleMobileMenuOpen = (event) =>
    setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  const handleLogout = () => {
    const nombre = localStorage.getItem("nombres_usuario");
    localStorage.clear();
    navigate("/login");
    console.log(`👋 Hasta luego, ${nombre || "usuario"}!`);
  };

  const seleccionarRol = (rol) => {
    localStorage.setItem("rol_usuario", rol);
    if (rol === "vendedor") {
      navigate("/crear-articulo");
    } else {
      navigate("/articulos");
    }
  };

  const { carrito } = useCarrito();
  const cantidadEnCarrito = carrito.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#45858C",
        height: "64px", // Asegura altura consistente
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "64px !important",
          px: 2, // Padding horizontal
          color: "white",
        }}
      >
        <Logo />

        {isMobile ? (
          <>
            <IconButton
              onClick={handleMobileMenuOpen}
              sx={{ color: "#F2E4BB" }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
            >
              <MenuItem onClick={() => navigate("/nosotros")}>Nosotros</MenuItem>
              <MenuItem onClick={() => navigate("/contacto")}>Contacto</MenuItem>

              <MenuItem
                onClick={() => seleccionarRol("comprador")}
                sx={{ minWidth: 220 }} // iguala espacio visual
              >
                🛒 Comprar artículos
              </MenuItem>

              {!isLoggedIn ? (
                <>
                  <MenuItem onClick={() => navigate("/login")}>
                    Iniciar sesión
                  </MenuItem>
                  <MenuItem onClick={() => navigate("/registro")}>
                    Registrarse
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={() => navigate("/user")}>Perfil</MenuItem>
                  <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                </>
              )}

              <MenuItem onClick={() => navigate("/carrito")}>
                <Badge badgeContent={cantidadEnCarrito} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box display="flex" alignItems="center" gap={2}>
            <Button onClick={() => navigate("/")} sx={{ color: "white" }}>
              Inicio
            </Button>
            <Button onClick={() => navigate("/nosotros")} sx={{ color: "white" }}>
              Nosotros
            </Button>
            <Button onClick={() => navigate("/contacto")} sx={{ color: "white" }}>
              Contacto
            </Button>

            <Button
              onClick={() => seleccionarRol("comprador")}
              sx={{ color: "white", minWidth: 220 }} // iguala tamaño al menú original
            >
              🛒 Comprar artículos
            </Button>

            {!isLoggedIn ? (
              <>
                <LoginButton />
                <Button
                  onClick={() => navigate("/registro")}
                  variant="outlined"
                  sx={{ color: "#1E1E1E", borderColor: "#1E1E1E" }}
                >
                  Registrarse
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body1" sx={{ color: "#C9F235" }}>
                  ¡Hola, <strong>{nombre}</strong>!
                </Typography>
                <PerfilMenu />
                <LogoutButton variant="text" size="small" />
              </>
            )}

            <IconButton
              onClick={() => navigate("/carrito")}
              sx={{ color: "#1E1E1E" }}
            >
              <Badge badgeContent={cantidadEnCarrito} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
