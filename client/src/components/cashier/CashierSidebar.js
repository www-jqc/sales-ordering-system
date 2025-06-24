import React from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { FaCashRegister, FaHistory, FaSignOutAlt, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Notifications from '../common/Notifications';

const CashierSidebar = ({ activeComponent, setActiveComponent }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Cashier Desk', icon: FaCashRegister },
    { id: 'history', label: 'Transaction History', icon: FaHistory },
  ];

  return (
    <div className="sidebar border-end bg-light vh-100">
      <Navbar bg="light" className="border-bottom">
        <Container>
          <Navbar.Brand className="fw-bold">
            <FaUtensils className="me-2" />
            Cashier Panel
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
              className={`mb-2 d-flex align-items-center rounded-3 ${activeComponent === item.id ? 'active bg-primary text-white shadow-sm' : 'text-dark'}`}
              onClick={() => setActiveComponent(item.id)}
              style={{ padding: '0.75rem 1rem', cursor: 'pointer' }}
            >
              <IconComponent className="me-3" size="1.2em" />
              <span className="fw-medium">{item.label}</span>
            </Nav.Link>
          );
        })}
        
        <hr className="my-3" />
        
        <Nav.Link 
          className="text-danger d-flex align-items-center" 
          onClick={handleLogout}
          style={{ padding: '0.75rem 1rem', cursor: 'pointer' }}
        >
          <FaSignOutAlt className="me-3" size="1.2em" />
          <span className="fw-medium">Logout</span>
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default CashierSidebar;