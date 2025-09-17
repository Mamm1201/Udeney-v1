import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RoleBasedNavigation from '../components/common/RoleBasedNavigation';
import AppRoutes from '../appRoutes';

function AppContent() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
