import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRoutes from '../appRoutes';

function AppContent() {
  const location = useLocation();

  return (
    <>
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
