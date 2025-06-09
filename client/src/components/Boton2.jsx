import Button from '@mui/material/Button';

export default function ComprarButton() {
  return (
    <Button
      href="#text-buttons"
      variant="contained"
      sx={{
        backgroundColor: '#16a34a',
        color: '#fff',
        '&:hover': {
          backgroundColor: '#15803d', // más oscuro al hacer hover
        },
        textTransform: 'none', // evita que se vea en mayúsculas
        fontWeight: 'bold',
        px: 3, // padding horizontal
        py: 1.5, // padding vertical
        borderRadius: 2, // bordes redondeados
      }}
    >
      Comprar
    </Button>
  );
}
