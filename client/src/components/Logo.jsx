import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

const Logo = () => {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate('/')}
      sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
    >
      <img
        src="./logo.png"
        alt="Eduney Logo"
        style={{ height: '50px', marginLeft: '10px' }}
      />
    </Box>
  );
};

export default Logo;
