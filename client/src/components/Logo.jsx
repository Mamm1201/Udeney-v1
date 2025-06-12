import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import logo from "../assets/logo.png";

const Logo = () => {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate("/")}
      sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
    >
      <img
        src={logo}
        alt="Eduney Logo"
        style={{ height: "50px", marginLeft: "10px" }}
      />
    </Box>
  );
};

export default Logo;
