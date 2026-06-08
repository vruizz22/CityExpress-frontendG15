import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoutesPage from '../pages/RoutesPage';
import PackagesPage from '../pages/PackagesPage';
import LandingPage from '../pages/LandingPage';
import NavBar from '../components/NavBar';
import CreateShipmentPage from '../pages/CreateShipmentPage';
import MyShipmentsPage from '../pages/MyShipmentsPage';
import AdminRoute from '../components/AdminRoute';
import ShipmentDetailPage from '../pages/ShipmentDetailPage';
import PaymentReturnPage from '../pages/PaymentReturnPage';

export default function AppRouter() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/packages"
          element={
            <AdminRoute>
              <PackagesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/routes"
          element={
            <AdminRoute>
              <RoutesPage />
            </AdminRoute>
          }
        />
        <Route path="/create-shipment" element={<CreateShipmentPage />} />
        <Route path="/my-shipments" element={<MyShipmentsPage />} />
        <Route path="/shipments/:shipmentId" element={<ShipmentDetailPage />} />
        <Route path="/payment-return" element={<PaymentReturnPage />} />
      </Routes>
    </Router>
  );
}
