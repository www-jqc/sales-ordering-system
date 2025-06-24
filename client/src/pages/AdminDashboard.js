import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUsers, FaTable, FaUtensils, FaChartBar } from 'react-icons/fa';
import { SocketContext } from '../contexts/SocketContext';
import { toast } from 'react-toastify';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardHome from '../components/admin/DashboardHome';
import OrderManagement from '../components/admin/OrderManagement';
import TransactionManagement from '../components/admin/TransactionManagement';
import TableManagement from '../components/admin/TableManagement';
import TableQRManagement from '../components/admin/TableQRManagement';
import UserManagement from '../components/admin/UserManagement';
import MenuManagement from '../components/admin/MenuManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import Reports from '../components/admin/Reports';
import SalesAnalytics from '../components/admin/SalesAnalytics';
import ActivityLog from '../components/admin/ActivityLog';
import SystemSettings from '../components/admin/SystemSettings';
import EmployeeManagement from '../components/admin/EmployeeManagement';

const AdminDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const { socket, connected } = useContext(SocketContext);

  useEffect(() => {
    if (socket && connected) {
      socket.emit('join_room', 'admin_updates');

      const handleAssistanceRequest = (requestData) => {
        // Play notification sound
        try {
          const audio = new Audio('/notifications.mp3');
          audio.volume = 0.6; // Set volume to 60%
          audio.play().catch(err => {
            console.log('Could not play notification sound:', err);
          });
        } catch (error) {
          console.log('Error creating audio element:', error);
        }
        
        toast.info(`Customer at Table ${requestData.tableId} needs assistance!`);
      };

      socket.on('assistance_request', handleAssistanceRequest);

      return () => {
        socket.off('assistance_request', handleAssistanceRequest);
        socket.emit('leave_room', 'admin_updates');
      };
    }
  }, [socket, connected]);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <DashboardHome />;
      case 'orders':
        return <OrderManagement />;
      case 'transactions':
        return <TransactionManagement />;
      case 'tables':
        return <TableManagement />;
      case 'qr-tables':
        return <TableQRManagement />;
      case 'users':
        return <UserManagement />;
      case 'employees':
        return <EmployeeManagement />;
      case 'menu':
        return <MenuManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'reports':
        return <Reports />;
      case 'sales-analytics':
        return <SalesAnalytics />;
      case 'activity':
        return <ActivityLog />;
      case 'settings':
        return <SystemSettings />;
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