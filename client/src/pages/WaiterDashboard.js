import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, Nav, Tab, Dropdown, Offcanvas } from 'react-bootstrap';
import { SocketContext } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { FaConciergeBell, FaUtensils, FaCheckCircle, FaClock, FaTable, FaUsers, FaSignOutAlt, FaUser, FaBars, FaBell, FaMoon, FaSun } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import TableStatus from '../components/waiter/TableStatus';
import OrderNotification from '../components/waiter/OrderNotification';
import ConnectionStatus from '../components/common/ConnectionStatus';
import { subscribeUserToPush } from '../utils/push';

const WaiterDashboard = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useState('light');
  const [notificationCount, setNotificationCount] = useState(0);
  const { socket, connected } = useContext(SocketContext);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt to subscribe user for push notifications when the component mounts
    subscribeUserToPush();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleNewNotification = () => {
    setNotificationCount(prev => prev + 1);
  };
  
  const resetNotificationCount = () => {
    setNotificationCount(0);
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  useEffect(() => {
    if (socket && connected) {
      socket.emit('join_room', 'waiter_updates');
      
      const handleOrderStatusUpdate = (updateData) => {
        const { order, status } = updateData;

        if (status === 'COMPLETED') {
          setCompletedOrders(prev => {
            const exists = prev.some(o => o.id === order.id);
            return exists ? prev : [order, ...prev];
          });
        } else if (status === 'DELIVERED') {
          // Remove from the list once delivered
          setCompletedOrders(prev => prev.filter(o => o.id !== order.id));
        }
      };

      socket.on('order_status_update', handleOrderStatusUpdate);

      return () => {
        socket.off('order_status_update', handleOrderStatusUpdate);
      };
    }
  }, [socket, connected]);

  const fetchCompletedOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders?status=COMPLETED');
      setCompletedOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load completed orders');
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async (orderId) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: 'DELIVERED' });
      // The socket event will handle the UI update, but we can also be optimistic
      setCompletedOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success(`Order #${orderId} marked as delivered!`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getTimeElapsed = (timestamp) => {
    if (!timestamp) return 'N/A';
    const now = new Date();
    const completed = new Date(timestamp);
    const diffMs = now - completed;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className={`waiter-dashboard ${theme}-mode`}>
        <div className="loading-mobile">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`waiter-dashboard ${theme}-mode`}>
      {/* Order Notifications */}
      <OrderNotification socket={socket} onNewNotification={handleNewNotification} />
      
      {/* Mobile Header */}
      <div className="bg-primary text-white py-3 px-3 d-lg-none mobile-header">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Button
              variant="light"
              size="sm"
              onClick={() => setShowMobileMenu(true)}
              className="me-3"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <FaBars />
            </Button>
            <h5 className="mb-0">Waiter Dashboard</h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            <ConnectionStatus />
            <Button
              variant="outline-light"
              size="sm"
              onClick={resetNotificationCount}
              className="position-relative"
            >
              <FaBell />
              {notificationCount > 0 && (
                <Badge 
                  pill 
                  bg="danger"
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="bg-primary text-white py-3 px-4 d-none d-lg-block">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="mb-0">Waiter Dashboard</h1>
          <div className="d-flex align-items-center gap-3">
            <ConnectionStatus />
            <Button variant="outline-light" onClick={toggleTheme} className="d-flex align-items-center">
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </Button>
            <Button variant="outline-light" onClick={resetNotificationCount} className="position-relative">
              <FaBell />
              {notificationCount > 0 && (
                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
            <Dropdown>
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                <FaUser className="me-2" />
                Waiter
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Offcanvas 
        show={showMobileMenu} 
        onHide={() => setShowMobileMenu(false)} 
        placement="start"
        className="offcanvas-mobile"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column gap-2">
            <Button
              variant={activeTab === 'orders' ? 'primary' : 'outline-primary'}
              className="text-start py-3"
              onClick={() => {
                setActiveTab('orders');
                setShowMobileMenu(false);
              }}
            >
              <FaConciergeBell className="me-2" />
              Ready for Delivery ({completedOrders.length})
            </Button>
            <Button
              variant={activeTab === 'tables' ? 'primary' : 'outline-primary'}
              className="text-start py-3"
              onClick={() => {
                setActiveTab('tables');
                setShowMobileMenu(false);
              }}
            >
              <FaTable className="me-2" />
              Table Status
            </Button>
            <hr />
            <Button
              variant="outline-secondary"
              className="text-start py-3 d-flex justify-content-between align-items-center"
              onClick={() => { toggleTheme(); setShowMobileMenu(false); }}
            >
              <span>
                {theme === 'light' ? <FaMoon className="me-2" /> : <FaSun className="me-2" />}
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
              </span>
            </Button>
            <Button
              variant="outline-danger"
              className="text-start py-3"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" />
              Logout
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content */}
      <Container fluid className="p-0">
        {/* Mobile Tab Navigation */}
        <div className="d-lg-none mobile-tab-nav">
          <div className="d-flex">
            <Button
              variant={activeTab === 'orders' ? 'primary' : 'light'}
              className="flex-fill rounded-0 border-0 py-3"
              onClick={() => setActiveTab('orders')}
            >
              <FaConciergeBell className="me-2" />
              Orders ({completedOrders.length})
            </Button>
            <Button
              variant={activeTab === 'tables' ? 'primary' : 'light'}
              className="flex-fill rounded-0 border-0 py-3"
              onClick={() => setActiveTab('tables')}
            >
              <FaTable className="me-2" />
              Tables
            </Button>
          </div>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="d-none d-lg-block px-4 pt-3">
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="orders">
                  <FaConciergeBell className="me-2" />
                  Ready for Delivery ({completedOrders.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tables">
                  <FaTable className="me-2" />
                  Table Status
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Tab.Container>
        </div>

        {/* Content Area */}
        <div className="px-3 px-lg-4 pb-4">
          {activeTab === 'orders' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 h6-mobile">Ready for Delivery</h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={fetchCompletedOrders}
                  className="d-none d-md-inline"
                >
                  Refresh
                </Button>
              </div>

              {completedOrders.length > 0 ? (
                <div className="row g-3">
                  {completedOrders.map(order => (
                    <div key={order.id} className="col-12">
                      <MobileOrderCard 
                        order={order} 
                        onMarkDelivered={markAsDelivered}
                        getTimeElapsed={getTimeElapsed}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="empty-state-mobile">
                  <Card.Body>
                    <FaConciergeBell size={48} className="icon mb-3" />
                    <h6>No orders ready for delivery</h6>
                    <p className="text-muted mb-3">Completed orders from the kitchen will appear here.</p>
                    <Button variant="outline-primary" onClick={fetchCompletedOrders}>
                      Refresh Orders
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'tables' && (
            <TableStatus />
          )}
        </div>
      </Container>
    </div>
  );
};

// Mobile-optimized Order Card Component
const MobileOrderCard = ({ order, onMarkDelivered, getTimeElapsed }) => {
  return (
    <Card className="shadow-sm border-0 mobile-order-card">
      <Card.Header className="bg-success text-white py-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 h6-mobile">Order #{order.id}</h6>
            <small>Table {order.table_number}</small>
          </div>
          <div className="text-end">
            <div className="small small-mobile">
              <FaClock className="me-1" />
              {getTimeElapsed(order.completed_at)}m ago
            </div>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="p-3">
          <div className="mb-3">
            <h6 className="text-muted mb-2 h6-mobile">Items:</h6>
            <div className="space-y-2">
              {order.order_items.map(item => (
                <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div className="d-flex align-items-center">
                    {item.product_image_url && (
                      <img 
                        src={item.product_image_url} 
                        alt={item.product_name}
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          objectFit: 'cover', 
                          borderRadius: '6px',
                          marginRight: '12px'
                        }} 
                      />
                    )}
                    <div>
                      <div className="fw-bold h6-mobile">{item.product_name}</div>
                      <small className="text-muted small-mobile">Qty: {item.quantity}</small>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold h6-mobile">₱{parseFloat(item.subtotal).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="mb-0 h6-mobile">Total Amount</h6>
              <h5 className="text-success mb-0">₱{parseFloat(order.total_amount).toFixed(2)}</h5>
            </div>
          </div>
          
          <Button 
            variant="success" 
            size="lg"
            className="w-100 py-3"
            onClick={() => onMarkDelivered(order.id)}
          >
            <FaCheckCircle className="me-2" />
            Mark as Delivered
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WaiterDashboard; 