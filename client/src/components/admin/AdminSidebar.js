import React from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { 
  FaHome, 
  FaTable, 
  FaUsers, 
  FaUtensils, 
  FaSignOutAlt, 
  FaQrcode, 
  FaChartBar, 
  FaListAlt, 
  FaHistory, 
  FaCreditCard, 
  FaClipboardList, 
  FaCog, 
  FaUserTie
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Notifications from '../common/Notifications';

const AdminSidebar = ({ activeComponent, setActiveComponent }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'orders', label: 'Order Management', icon: FaClipboardList },
    { id: 'transactions', label: 'Transaction Management', icon: FaCreditCard },
    { id: 'tables', label: 'Table Management', icon: FaTable },
    { id: 'qr-tables', label: 'QR Table Management', icon: FaQrcode },
    { id: 'users', label: 'User Management', icon: FaUsers },
    { id: 'employees', label: 'Employee Management', icon: FaUserTie },
    { id: 'menu', label: 'Menu Management', icon: FaUtensils },
    { id: 'categories', label: 'Category Management', icon: FaListAlt },
    { id: 'reports', label: 'Reports', icon: FaChartBar },
    { id: 'sales-analytics', label: 'Sales Analytics', icon: FaChartBar },
    { id: 'activity', label: 'Activity Log', icon: FaHistory },
    { id: 'settings', label: 'System Settings', icon: FaCog }
  ];

  return (
    <div className="sidebar border-end">
      <Navbar bg="light" className="border-bottom">
        <Container>
          <Navbar.Brand className="fw-bold">
            <FaUtensils className="me-2" />
            Admin Panel
          </Navbar.Brand>
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <Notifications />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Nav className="flex-column p-3">
        {menuItems.map(item => {
          const IconComponent = item.icon;
          return (
            <Nav.Link
              key={item.id}
              className={`mb-2 ${activeComponent === item.id ? 'active bg-primary text-white' : 'text-dark'}`}
              onClick={() => setActiveComponent(item.id)}
            >
              <IconComponent className="me-2" />
              {item.label}
            </Nav.Link>
          );
        })}
        
        <hr className="my-3" />
        
        <Nav.Link 
          className="text-danger" 
          onClick={handleLogout}
        >
          <FaSignOutAlt className="me-2" />
          Logout
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default AdminSidebar; 