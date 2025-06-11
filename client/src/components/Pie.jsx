import React from "react";
import { Box, Typography, IconButton, Link as MuiLink } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { Link } from "react-router-dom";

const Pie = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#86C388",
        color: "white",
        padding: 2,
        textAlign: "center",
        mt: 4,
      }}
    >
      <Typography variant="body1">
        &copy; Eduney {new Date().getFullYear()} |{" "}
        <Link to="/AvisoLegal" style={{ color: "white", textDecoration: "underline" }}>
          Aviso legal
        </Link>{" "}
        |{" "}
        <Link to="/politica-privacidad" style={{ color: "white", textDecoration: "underline" }}>
          Política de privacidad
        </Link>{" "}
        |{" "}
        <Link to="/politica-cookies" style={{ color: "white", textDecoration: "underline" }}>
          Política de cookies
        </Link>
      </Typography>

      <Box mt={1}>
        <IconButton
          component={MuiLink}
          href="https://www.facebook.com/share/1RXuUs2LGZ/"
          target="_blank"
          rel="noopener"
          color="inherit"
          aria-label="Facebook"
        >
          <FacebookIcon />
        </IconButton>
        <IconButton
          component={MuiLink}
          href="https://twitter.com"
          target="_blank"
          rel="noopener"
          color="inherit"
          aria-label="Twitter"
        >
          <TwitterIcon />
        </IconButton>
        <IconButton
          component={MuiLink}
          href="https://instagram.com"
          target="_blank"
          rel="noopener"
          color="inherit"
          aria-label="Instagram"
        >
          <InstagramIcon />
        </IconButton>
        <IconButton
          component={MuiLink}
          href="https://linkedin.com"
          target="_blank"
          rel="noopener"
          color="inherit"
          aria-label="LinkedIn"
        >
          <LinkedInIcon />
        </IconButton>
      </Box>

      <Typography variant="body2" sx={{ mt: 1 }}>
        Desarrollado por Ficha 28264878 Sena
      </Typography>
    </Box>
  );
};

export default Pie;
