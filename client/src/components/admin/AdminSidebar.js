import React from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { FaHome, FaTable, FaUsers, FaUtensils, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ activeComponent, setActiveComponent }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'tables', label: 'Table Management', icon: FaTable },
    { id: 'users', label: 'User Management', icon: FaUsers },
    { id: 'menu', label: 'Menu Management', icon: FaUtensils }
  ];

  return (
    <div className="sidebar border-end">
      <Navbar bg="light" className="border-bottom">
        <Container>
          <Navbar.Brand className="fw-bold">
            <FaUtensils className="me-2" />
            Admin Panel
          </Navbar.Brand>
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