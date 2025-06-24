import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import KitchenSidebar from '../components/kitchen/KitchenSidebar';
import KitchenOrderDashboard from '../components/kitchen/KitchenOrderDashboard';
import MenuAvailability from '../components/kitchen/MenuAvailability';
import KitchenSettings from '../components/kitchen/KitchenSettings';

const KitchenDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <KitchenOrderDashboard />;
      case 'availability':
        return <MenuAvailability />;
      case 'settings':
        return <KitchenSettings />;
      default:
        return <KitchenOrderDashboard />;
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ position: 'fixed', top: 0, bottom: 0, width: '280px', zIndex: 100 }}>
        <KitchenSidebar 
            activeComponent={activeComponent} 
            setActiveComponent={setActiveComponent} 
        />
      </div>
      <div style={{ marginLeft: '280px', flexGrow: 1, padding: '1.5rem' }}>
        <Container fluid>
          <main>
            {renderComponent()}
          </main>
        </Container>
      </div>
    </div>
  );
};

export default KitchenDashboard;