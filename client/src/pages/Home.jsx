import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Pie from '../components/Pie';

// Lista de categorías para mostrar en tarjetas
const categorias = [
  {
    nombre: 'Útiles',
    imagen: '/colores.jpg',
    descripcion:
      'Artículos escolares en excelente estado: cuadernos, lápices, colores y más.',
    ruta: '/articulos',
  },
  {
    nombre: 'Herramientas',
    imagen: '/calculate.jpg',
    descripcion:
      'Herramientas tecnológicas y de aprendizaje para diferentes niveles educativos.',
    ruta: '/articulos',
  },
  {
    nombre: 'Libros',
    imagen: '/libro.jpg',
    descripcion:
      'Libros de texto, literatura y consulta para todas las edades.',
    ruta: '/articulos',
  },
  {
    nombre: 'Prendas',
    imagen: '/prenda.jpg',
    descripcion:
      'Uniformes y prendas escolares listas para reutilizar con amor.',
    ruta: '/articulos',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
      <Navbar />

      {/* Hero section con imagen de fondo responsive */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '70vh', md: '70vh' },
          width: '100%',
          backgroundImage: 'url(/nosotros.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 2, px: 2 }}>
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: { xs: '1.8rem', md: '3rem' },
              mb: 2,
            }}
          >
            DALE UNA SEGUNDA OPORTUNIDAD
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.2rem' },
            }}
          >
            En EduNey creemos en darle una nueva vida a las prendas y elementos
            institucionales. Ofrecemos artículos educativos de calidad a precios
            asequibles mientras cuidamos el medio ambiente.
          </Typography>
        </Box>
      </Box>

      {/* Sección de categorías */}
      <Box sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {categorias.map((cat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 3,
                  boxShadow: 4,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={cat.imagen}
                  alt={`Imagen de ${cat.nombre}`}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {cat.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cat.descripcion}
                  </Typography>
                </CardContent>
                <Box textAlign="center" pb={2}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(cat.ruta)}
                    sx={{
                      backgroundColor: '#8B8C69',
                      '&:hover': {
                        backgroundColor: '#BBBF4E',
                      },
                    }}
                  >
                    Ver {cat.nombre}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Sección informativa blanco */}
      <Box sx={{ backgroundColor: 'white', py: 6, px: { xs: 2, md: 4 } }}>
        <Grid container spacing={4} alignItems="stretch">
          {/* Texto */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                ¿En qué consiste la economía circular?
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: 'justify' }}
              >
                El modelo lineal tradicional —basado en extraer, usar y
                desechar— contribuye a la degradación del medio ambiente y a la
                sobreexplotación de recursos. En contraste, la economía circular
                es restaurativa y regenerativa por diseño. Su objetivo es
                mantener los productos, componentes y materiales en uso durante
                el mayor tiempo posible, conservando su valor. Este enfoque
                permite reducir la extracción de materias primas, disminuir
                residuos y acortar las distancias de transporte, lo que también
                baja la huella de carbono. Además, transforma los desechos en
                oportunidades de valor: por ejemplo, los restos orgánicos pueden
                convertirse en abono agrícola mediante compostaje, reduciendo el
                uso de químicos.
                <br />
                <br />
                Como explica Edson Grandisoli, Magíster en Ecología y Doctor en
                Educación y Sostenibilidad, en una entrevista con{' '}
                <strong>National Geographic</strong>, “al usar menos recursos,
                también se reduce la necesidad de transportarlos”.
              </Typography>
            </Box>
          </Grid>

          {/* Imagen */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Box
              component="img"
              src="/school.jpg"
              alt="Economía Circular"
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Sección final de llamado a la acción */}
      <Box
        sx={{
          px: 3,
          py: { xs: 6, md: 8 },
          bgcolor: '#BBBF4E',
          color: '#1a1a1a',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            maxWidth: 700,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: '#1a1a1a',
              textTransform: 'uppercase',
            }}
          >
            ¡Haz la diferencia hoy!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              color: '#333',
            }}
          >
            Al donar o reutilizar artículos escolares, no solo apoyas la
            educación, sino que también contribuyes a un planeta más limpio.
            Juntos, podemos construir un futuro más sostenible y justo para
            todos los niños y niñas.
          </Typography>

          <Button
            variant="contained"
            size="large"
            sx={{
              alignSelf: 'center',
              bgcolor: '#45858C',
              color: 'white',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#376c70',
              },
            }}
          >
            Quiero Contribuir
          </Button>
        </Box>
      </Box>

      <Pie />
    </Box>
  );
};

export default Home;
