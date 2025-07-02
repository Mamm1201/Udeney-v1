import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AppRoutes from '../appRoutes';

function App() {
  return (
    <Router>
      <Navbar />
      <AppRoutes />
    </Router>
  );
}

export default App;
