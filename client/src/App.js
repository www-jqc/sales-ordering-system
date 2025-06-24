import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import pages for different user roles
import CustomerMenu from './pages/CustomerMenu';
import CashierDashboard from './pages/CashierDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import WaiterDashboard from './pages/WaiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/common/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';

// Import contexts
import { AuthProvider, AuthContext, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Unlock audio playback after first user interaction
function useUnlockAudio() {
  React.useEffect(() => {
    const unlock = () => {
      // Pre-load the notification sound to ensure it plays on mobile
      const audio = new window.Audio('/notifications.mp3');
      audio.volume = 0;
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {});
      
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);
}

function App() {
  useUnlockAudio();
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

const AppRoutes = () => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<CustomerMenu />} />
        <Route path="/menu/:tableId" element={<CustomerMenu />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Protected routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/cashier" element={<ProtectedRoute allowedRoles={['cashier', 'admin']}><CashierDashboard /></ProtectedRoute>} />
        <Route path="/kitchen" element={<ProtectedRoute allowedRoles={['kitchen', 'admin']}><KitchenDashboard /></ProtectedRoute>} />
        <Route path="/waiter" element={<ProtectedRoute allowedRoles={['waiter', 'admin']}><WaiterDashboard /></ProtectedRoute>} />

        {/* Redirect logic */}
        <Route path="/" element={isAuthenticated ? <Navigate to={`/${user.role}`} /> : <Login />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default App; 