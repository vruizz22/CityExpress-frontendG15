import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoutesPage from '../pages/RoutesPage';
import PackagesPage from '../pages/PackagesPage';
import LandingPage from '../pages/LandingPage';
import NavBar from '../components/NavBar';

export default function AppRouter() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/routes" element={<RoutesPage />} />
      </Routes>
    </Router>
  );
}
