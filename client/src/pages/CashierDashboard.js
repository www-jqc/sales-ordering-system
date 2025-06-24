import React, { useState } from 'react';
import CashierSidebar from '../components/cashier/CashierSidebar';
import CashierDesk from '../components/cashier/CashierDesk';
import TransactionHistory from '../components/cashier/TransactionHistory';
import Container from 'react-bootstrap/Container';

const CashierDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <CashierDesk />;
      case 'history':
        return <TransactionHistory />;
      default:
        return <CashierDesk />;
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ position: 'fixed', top: 0, bottom: 0, width: '280px', zIndex: 100 }}>
        <CashierSidebar 
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

export default CashierDashboard;