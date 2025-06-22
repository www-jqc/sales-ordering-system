import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUsers, FaTable, FaUtensils, FaChartBar } from 'react-icons/fa';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardHome from '../components/admin/DashboardHome';
import TableManagement from '../components/admin/TableManagement';
import UserManagement from '../components/admin/UserManagement';

const AdminDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <DashboardHome />;
      case 'tables':
        return <TableManagement />;
      case 'users':
        return <UserManagement />;
      case 'menu':
        return <div>Menu Management Component</div>;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <Container fluid className="p-0">
      <Row>
        <Col md={3} lg={2} className="p-0">
          <AdminSidebar 
            activeComponent={activeComponent} 
            setActiveComponent={setActiveComponent} 
          />
        </Col>
        <Col md={9} lg={10} className="p-4">
          {renderComponent()}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard; 