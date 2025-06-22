import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Unlock audio playback after first user interaction
function useUnlockAudio() {
  React.useEffect(() => {
    const unlock = () => {
      // Try to unlock both notification.mp3 and notifications.mp3
      ['/notification.mp3', '/notifications.mp3'].forEach((src) => {
        const audio = new window.Audio(src);
        audio.volume = 0;
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
        }).catch(() => {});
      });
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
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<CustomerMenu />} />
              <Route path="/menu/:tableId" element={<CustomerMenu />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes for different roles */}
              <Route path="/cashier" element={<CashierDashboard />} />
              <Route path="/kitchen" element={<KitchenDashboard />} />
              <Route path="/waiter" element={<WaiterDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
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
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App; 