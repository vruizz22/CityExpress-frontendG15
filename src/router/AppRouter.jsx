import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoutesPage from '../pages/RoutesPage';
import PackagesPage from '../pages/PackagesPage';
import LandingPage from '../pages/LandingPage';
import NavBar from '../components/NavBar';

export default function AppRouter() {
  /*   const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect( () => 
  {
    const storedUser = localStorage.getItem("user");
    const sotredToken = localStorage.getItem("token");
    if (storedUser && sotredToken){
      setCurrentUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  },
  []);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setCurrentUser(null);
  }; */

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
