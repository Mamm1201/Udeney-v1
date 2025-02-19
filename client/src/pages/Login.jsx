import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate para redirección
import axios from "axios";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material"; // Corrección en los componentes de Material-UI

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(""); // Estado para almacenar el rol seleccionado
  const navigate = useNavigate(); // Hook para la redirección

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesResponse = await axios.get("http://127.0.0.1:8000/roles/");
        console.log("Roles:", rolesResponse.data);
        setRoles(rolesResponse.data);
      } catch (error) {
        console.error("Error al obtener roles:", error);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/usuarios/", {
        email,
        password,
      });

      const userRole = response.data.rol; // Suponiendo que el backend devuelve el rol del usuario
      console.log("Usuario autenticado con rol:", userRole);

      // Redirigir según el rol
      if (userRole === "vendedor") {
        navigate("/crear-articulo");
      } else if (userRole === "comprador") {
        navigate("/articulos");
      } else {
        console.error("Rol no reconocido");
      }
    } catch (error) {
      console.error("Error en autenticación:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Correo electrónico</label>
            <input
              type="email"
              className="w-full p-2 border rounded mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Contraseña</label>
            <input
              type="password"
              className="w-full p-2 border rounded mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <FormControl variant="outlined" margin="normal" fullWidth>
            <InputLabel>Roles</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              label="Roles"
            >
              {roles.map((rol) => (
                <MenuItem key={rol.id_rol} value={rol.tipo_rol}>
                  {rol.tipo_rol}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Iniciar sesión
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          ¿No tienes una cuenta?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
