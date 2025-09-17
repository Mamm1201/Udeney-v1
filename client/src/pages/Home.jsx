import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
} from '@mui/material';
import {
  ExpandMore,
  Sell,
  ShoppingCart,
  Nature,
  AttachMoney,
  Security,
  Speed,
  GroupAdd,
  RecyclingOutlined,
  TrendingUp,
  School,
  Favorite,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Pie from '../components/Pie';

// Lista de categorías para mostrar en tarjetas
const categorias = [
  {
    nombre: 'utiles',
    nombreDisplay: 'Útiles Escolares',
    imagen: '/colores.jpg',
    descripcion:
      'Cuadernos, lápices, colores y más artículos escolares en excelente estado.',
    ruta: '/articulos',
    icono: <School />,
    color: '#4CAF50',
  },
  {
    nombre: 'herramientas',
    nombreDisplay: 'Herramientas',
    imagen: '/calculate.jpg',
    descripcion:
      'Calculadoras, reglas, compases y herramientas de aprendizaje tecnológicas.',
    ruta: '/articulos',
    icono: <Speed />,
    color: '#2196F3',
  },
  {
    nombre: 'libros',
    nombreDisplay: 'Libros de Texto',
    imagen: '/libro.jpg',
    descripcion:
      'Libros de texto, literatura y material de consulta para todas las edades.',
    ruta: '/articulos',
    icono: <Favorite />,
    color: '#FF6B35',
  },
  {
    nombre: 'prenda',
    nombreDisplay: 'Uniformes',
    imagen: '/prenda.jpg',
    descripcion:
      'Uniformes escolares en perfecto estado, listos para una segunda oportunidad.',
    ruta: '/articulos',
    icono: <GroupAdd />,
    color: '#9C27B0',
  },
];

// Preguntas frecuentes
const faqData = [
  {
    pregunta: '¿Cómo funciona EduNey?',
    respuesta:
      'EduNey conecta familias que tienen artículos escolares que ya no necesitan con aquellas que los buscan. Los vendedores publican sus artículos con fotos y descripciones, y los compradores pueden buscar y adquirir lo que necesiten de forma segura.',
  },
  {
    pregunta: '¿Es seguro comprar artículos usados?',
    respuesta:
      'Absolutamente. Todos los vendedores están verificados y cada artículo incluye fotos detalladas y descripción del estado. Además, contamos con un sistema de calificaciones para garantizar la confianza entre usuarios.',
  },
  {
    pregunta: '¿Qué tipo de artículos puedo vender?',
    respuesta:
      'Puedes vender uniformes escolares, libros de texto, útiles escolares, mochilas, calculadoras, y cualquier artículo relacionado con la educación que esté en buen estado.',
  },
  {
    pregunta: '¿Cómo ayudo al medio ambiente?',
    respuesta:
      'Al reutilizar artículos escolares, reduces la demanda de productos nuevos, disminuyes los residuos y contribuyes a la economía circular. Cada artículo reutilizado evita emisiones de CO2 y ahorra recursos naturales.',
  },
  {
    pregunta: '¿Hay costos por usar la plataforma?',
    respuesta:
      'EduNey es gratuito para compradores. Los vendedores solo pagan una pequeña comisión cuando completan una venta exitosa, lo que nos permite mantener la plataforma funcionando.',
  },
  {
    pregunta: '¿Cómo me registro?',
    respuesta:
      'El registro es muy sencillo. Solo necesitas proporcionar tu email, crear una contraseña y verificar tu cuenta. Luego puedes empezar a comprar o vender inmediatamente.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedFaq, setExpandedFaq] = useState(false);
  const [countUp, setCountUp] = useState({
    articulos: 0,
    familias: 0,
    co2: 0,
    ahorro: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  const handleFaqChange = panel => (event, isExpanded) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  // Animación count-up para las métricas
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const targets = {
        articulos: 12847,
        familias: 3420,
        co2: 8350,
        ahorro: 45,
      };
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setCountUp({
          articulos: Math.floor(targets.articulos * progress),
          familias: Math.floor(targets.familias * progress),
          co2: Math.floor(targets.co2 * progress),
          ahorro: Math.floor(targets.ahorro * progress),
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setCountUp(targets);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [isVisible]);

  // Datos de impacto ambiental con animación
  const impactData = [
    {
      label: 'Artículos Reutilizados',
      value: countUp.articulos.toLocaleString(),
      icon: <RecyclingOutlined />,
      key: 'articulos',
    },
    {
      label: 'Familias Conectadas',
      value: countUp.familias.toLocaleString(),
      icon: <GroupAdd />,
      key: 'familias',
    },
    {
      label: 'CO2 Evitado (kg)',
      value: countUp.co2.toLocaleString(),
      icon: <Nature />,
      key: 'co2',
    },
    {
      label: 'Ahorro Total (COP)',
      value: `$${countUp.ahorro}M`,
      icon: <TrendingUp />,
      key: 'ahorro',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
      {/* Animaciones CSS globales */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(76, 175, 80, 0.8);
          }
        }
      `}</style>
      <Navbar />

      {/* Hero Section Completamente Renovado */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '90vh', md: '95vh' },
          background:
            'linear-gradient(135deg, #45858C 0%, #2E7D32 30%, #4CAF50 60%, #66BB6A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 235, 59, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(76, 175, 80, 0.1) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Elementos decorativos mejorados */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            right: '8%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background:
              'linear-gradient(45deg, rgba(255, 255, 255, 0.15), rgba(255, 235, 59, 0.1))',
            animation: 'float 8s ease-in-out infinite',
            filter: 'blur(1px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background:
              'linear-gradient(45deg, rgba(255, 107, 53, 0.2), rgba(255, 255, 255, 0.1))',
            animation: 'float 6s ease-in-out infinite reverse',
            filter: 'blur(1px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: '5%',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            animation: 'float 4s ease-in-out infinite',
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
              <Fade in timeout={1000}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="h1"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: { xs: '2.8rem', md: '4rem', lg: '4.5rem' },
                      mb: 3,
                      lineHeight: 1.1,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Dale una
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        background: 'linear-gradient(45deg, #FFE082, #FFF59D)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 900,
                      }}
                    >
                      Segunda Vida
                    </Box>
                    a los útiles escolares
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      mb: 4,
                      fontSize: { xs: '1.2rem', md: '1.4rem' },
                      lineHeight: 1.5,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                      maxWidth: '90%',
                      mx: { xs: 'auto', md: 0 },
                    }}
                  >
                    🌱 Conectamos familias que intercambian uniformes, libros y
                    útiles escolares.
                    <Box
                      component="span"
                      sx={{ fontWeight: 'bold', color: '#E8F5E8' }}
                    >
                      Ahorra hasta 70% mientras cuidas el planeta.
                    </Box>
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 3,
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: { xs: 'center', md: 'flex-start' },
                      alignItems: 'center',
                      mb: 4,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingCart />}
                      onClick={() => navigate('/articulos')}
                      sx={{
                        bgcolor: '#4CAF50',
                        color: 'white',
                        px: 5,
                        py: 2.5,
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        borderRadius: 4,
                        minWidth: 220,
                        boxShadow:
                          '0 8px 25px rgba(76, 175, 80, 0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#FFE082',
                          color: '#2E7D32',
                          bgcolor: '#FFE082',
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: '0 12px 35px rgba(255, 224, 130, 0.4)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      🛒 Explorar Artículos
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<Sell />}
                      onClick={() => {
                        const isLoggedIn =
                          !!localStorage.getItem('access_token');
                        navigate(isLoggedIn ? '/crear-articulo' : '/registro');
                      }}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 5,
                        py: 2.5,
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        borderRadius: 4,
                        borderWidth: 3,
                        minWidth: 220,
                        textTransform: 'none',
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                        '&:hover': {
                          borderColor: '#FFE082',
                          color: '#2E7D32',
                          bgcolor: '#FFE082',
                          transform: 'translateY(-3px) scale(1.02)',
                          boxShadow: '0 12px 35px rgba(255, 224, 130, 0.4)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      💰 Empezar a Vender
                    </Button>
                  </Box>

                  {/* Estadísticas dinámicas en el texto */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 4,
                      mt: 3,
                      flexWrap: 'wrap',
                      justifyContent: { xs: 'center', md: 'flex-start' },
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="h4"
                        sx={{
                          color: '#FFE082',
                          fontWeight: 'bold',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                        }}
                      >
                        +{countUp.familias.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.8)' }}
                      >
                        Familias conectadas
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="h4"
                        sx={{
                          color: '#FFE082',
                          fontWeight: 'bold',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                        }}
                      >
                        {countUp.co2.toLocaleString()}kg
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.8)' }}
                      >
                        CO2 evitado
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
              <Grow in timeout={1500}>
                <Box
                  sx={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                  }}
                >
                  {/* Imagen principal lifestyle - familias intercambiando */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: 450,
                      height: 350,
                      borderRadius: 6,
                      overflow: 'hidden',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                      transform:
                        'perspective(1000px) rotateY(-5deg) rotateX(2deg)',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform:
                          'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.03)',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                      },
                    }}
                  >
                    {/* Imagen principal mejorada */}
                    <Box
                      component="img"
                      src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&h=400&fit=crop&q=80"
                      alt="Familias intercambiando útiles escolares"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(1.1) contrast(1.1)',
                      }}
                    />

                    {/* Overlay con mensaje */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          'linear-gradient(transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)',
                        color: 'white',
                        p: 3,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        👨‍👩‍👧‍👦 Familias que se Ayudan
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Intercambio seguro y económico entre padres
                      </Typography>
                    </Box>

                    {/* Badge de impacto */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: '#4CAF50',
                        color: 'white',
                        px: 2,
                        py: 1,
                        borderRadius: 3,
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                      }}
                    >
                      💚 Eco-Friendly
                    </Box>
                  </Box>

                  {/* Collage de productos en una disposición atractiva */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 2,
                      width: '100%',
                      maxWidth: 300,
                      mt: 2,
                    }}
                  >
                    {[
                      {
                        src: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=150&h=150&fit=crop',
                        alt: 'Uniformes escolares',
                        emoji: '👕',
                        transform: 'rotate(-8deg)',
                      },
                      {
                        src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=150&h=150&fit=crop',
                        alt: 'Libros de texto',
                        emoji: '📚',
                        transform: 'rotate(5deg)',
                      },
                      {
                        src: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=150&h=150&fit=crop',
                        alt: 'Mochilas',
                        emoji: '🎒',
                        transform: 'rotate(-3deg)',
                      },
                    ].map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          aspectRatio: '1/1',
                          borderRadius: 3,
                          overflow: 'hidden',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                          transform: item.transform,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'rotate(0deg) scale(1.1)',
                            zIndex: 10,
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={item.src}
                          alt={item.alt}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                          }}
                        >
                          {item.emoji}
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Testimonial rápido */}
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(15px)',
                      borderRadius: 4,
                      p: 3,
                      mt: 2,
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      maxWidth: 350,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'white',
                        fontStyle: 'italic',
                        mb: 1,
                        fontSize: '1rem',
                      }}
                    >
                      "Ahorré $200,000 en útiles este año y mi hija está feliz
                      con sus nuevos libros"
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 'bold',
                      }}
                    >
                      - María, madre de familia
                    </Typography>
                  </Box>
                </Box>
              </Grow>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Sección: ¿Por qué Publicar tus Artículos? */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight="bold"
          gutterBottom
          sx={{ color: '#45858C', mb: 6 }}
        >
          ¿Por qué Publicar tus Artículos Escolares?
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              icon: <AttachMoney />,
              title: 'Genera Ingresos Extra',
              description:
                'Convierte esos uniformes y libros en dinero real. Los artículos escolares mantienen su valor y las familias los buscan constantemente.',
              color: '#4CAF50',
            },
            {
              icon: <RecyclingOutlined />,
              title: 'Impacto Ambiental Positivo',
              description:
                'Cada artículo que vendes evita la producción de uno nuevo, reduciendo emisiones de CO2 y el uso de recursos naturales.',
              color: '#2E7D32',
            },
            {
              icon: <GroupAdd />,
              title: 'Ayudas a Otras Familias',
              description:
                'Facilitas el acceso a educación de calidad a familias que buscan opciones económicas para sus hijos.',
              color: '#FF6B35',
            },
            {
              icon: <Speed />,
              title: 'Proceso Súper Fácil',
              description:
                'Toma fotos, escribe una descripción y publica. Nosotros nos encargamos del resto, incluyendo la comunicación con compradores.',
              color: '#2196F3',
            },
          ].map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Grow in timeout={1000 + index * 200}>
                <Card
                  elevation={4}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: item.color,
                        width: 60,
                        height: 60,
                        mb: 3,
                      }}
                    >
                      {item.icon}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      lineHeight={1.7}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Sección: ¿Por qué Comprar Aquí? */}
      <Box sx={{ bgcolor: '#F8F9FA', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight="bold"
            gutterBottom
            sx={{ color: '#45858C', mb: 6 }}
          >
            ¿Por qué Comprar en EduNey?
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                icon: <AttachMoney />,
                title: 'Precios Increíbles',
                description:
                  'Ahorra hasta 70% comparado con artículos nuevos. La educación de calidad no tiene que ser costosa.',
                stats: 'Ahorro promedio: 65%',
              },
              {
                icon: <Security />,
                title: 'Compra Segura',
                description:
                  'Todos los vendedores están verificados. Revisamos cada publicación y ofrecemos garantía de satisfacción.',
                stats: '99.8% satisfacción',
              },
              {
                icon: <Speed />,
                title: 'Entrega Rápida',
                description:
                  'Conectamos con vendedores locales para entregas el mismo día o acordamos puntos de encuentro seguros.',
                stats: 'Entrega promedio: 2 días',
              },
              {
                icon: <Nature />,
                title: 'Conciencia Ambiental',
                description:
                  'Cada compra es un voto por el planeta. Reduces residuos y enseñas valores sostenibles a tus hijos.',
                stats: '850kg CO2 evitados por familia',
              },
            ].map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor:
                        item.icon.props.children === AttachMoney
                          ? '#4CAF50'
                          : item.icon.props.children === Security
                            ? '#2196F3'
                            : item.icon.props.children === Speed
                              ? '#FF6B35'
                              : '#2E7D32',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor:
                            item.icon.props.children === AttachMoney
                              ? '#4CAF50'
                              : item.icon.props.children === Security
                                ? '#2196F3'
                                : item.icon.props.children === Speed
                                  ? '#FF6B35'
                                  : '#2E7D32',
                          width: 50,
                          height: 50,
                          mr: 2,
                        }}
                      >
                        {item.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {item.title}
                        </Typography>
                        <Chip
                          label={item.stats}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      lineHeight={1.6}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Sección de Categorías Mejorada */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight="bold"
          gutterBottom
          sx={{ color: '#45858C', mb: 2 }}
        >
          Explora por Categorías
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Encuentra exactamente lo que necesitas para el año escolar
        </Typography>

        <Grid container spacing={4}>
          {categorias.map((cat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in timeout={1000 + index * 150}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: `0 12px 40px rgba(0,0,0,0.15)`,
                    },
                    '&:hover .category-overlay': {
                      opacity: 1,
                    },
                  }}
                  onClick={() =>
                    navigate(
                      `${cat.ruta}?id_categoria__nombre_categoria=${encodeURIComponent(cat.nombre)}`
                    )
                  }
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={cat.imagen}
                      alt={`Imagen de ${cat.nombreDisplay}`}
                      sx={{ transition: 'transform 0.4s ease' }}
                    />

                    {/* Overlay con gradiente */}
                    <Box
                      className="category-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(45deg, ${cat.color}CC, ${cat.color}88)`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: 'white',
                          color: cat.color,
                          width: 60,
                          height: 60,
                        }}
                      >
                        {cat.icono}
                      </Avatar>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {cat.nombreDisplay}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      lineHeight={1.6}
                    >
                      {cat.descripcion}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        mt: 2,
                        borderColor: cat.color,
                        color: cat.color,
                        '&:hover': {
                          borderColor: cat.color,
                          bgcolor: cat.color,
                          color: 'white',
                        },
                      }}
                    >
                      Ver {cat.nombreDisplay}
                    </Button>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Sección de Impacto Ambiental */}
      <Box sx={{ bgcolor: '#E8F5E8', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                fontWeight="bold"
                gutterBottom
                sx={{ color: '#2E7D32' }}
              >
                Nuestro Compromiso con el Planeta
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                La economía circular no es solo una tendencia, es el futuro de
                nuestro planeta
              </Typography>

              <Box sx={{ mt: 4 }}>
                {[
                  'Reducimos la producción de nuevos artículos escolares',
                  'Disminuimos los residuos textiles y plásticos',
                  'Fomentamos el consumo responsable en las familias',
                  'Creamos una comunidad consciente del medio ambiente',
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                  >
                    <Nature sx={{ color: '#4CAF50', mr: 2 }} />
                    <Typography variant="body1">{item}</Typography>
                  </Box>
                ))}
              </Box>

              <Button
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  bgcolor: '#2E7D32',
                  px: 4,
                  py: 1.5,
                  '&:hover': { bgcolor: '#1B5E20' },
                }}
              >
                Únete al Cambio
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/school.jpg"
                alt="Economía Circular"
                sx={{
                  width: '100%',
                  borderRadius: 4,
                  boxShadow: 4,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Sección de FAQ */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          fontWeight="bold"
          gutterBottom
          sx={{ color: '#45858C', mb: 6 }}
        >
          Preguntas Frecuentes
        </Typography>

        {faqData.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expandedFaq === `panel${index}`}
            onChange={handleFaqChange(`panel${index}`)}
            sx={{
              mb: 2,
              borderRadius: 2,
              '&:before': { display: 'none' },
              boxShadow: 2,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                bgcolor: '#F8F9FA',
                borderRadius: '8px 8px 0 0',
                '&.Mui-expanded': {
                  borderRadius: '8px 8px 0 0',
                },
              }}
            >
              <Typography variant="h6" fontWeight="600">
                {faq.pregunta}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              <Typography variant="body1" lineHeight={1.7}>
                {faq.respuesta}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>

      {/* Call to Action Final */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #45858C 0%, #2E7D32 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            ¿Listo para Hacer la Diferencia?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Únete a miles de familias que ya están transformando la educación y
            cuidando el planeta
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={() => navigate('/registro')}
              sx={{
                bgcolor: '#FF6B35',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#E55722' },
              }}
            >
              Empezar a Comprar
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Sell />}
              onClick={() => navigate('/registro')}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                borderWidth: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: '#FFE082',
                  color: '#FFE082',
                },
              }}
            >
              Empezar a Vender
            </Button>
          </Box>
        </Container>
      </Box>

      <Pie />

      {/* Estilos para animaciones */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </Box>
  );
};

export default Home;
