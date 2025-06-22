import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, Nav, Tab } from 'react-bootstrap';
import { SocketContext } from '../contexts/SocketContext';
import { FaConciergeBell, FaUtensils, FaCheckCircle, FaClock, FaTable, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import TableStatus from '../components/waiter/TableStatus';
import ConnectionStatus from '../components/common/ConnectionStatus';

const WaiterDashboard = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const { socket, connected } = useContext(SocketContext);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket && connected) {
      socket.emit('join_room', 'waiter');
      const handleOrderReady = (data) => {
        playNotificationSound();
        setReadyOrders(prev => {
          const exists = prev.some(o => o.id === data.orderId);
          if (!exists) {
            return [data.order, ...prev];
          }
          return prev;
        });
        setActiveOrders(prev => prev.filter(o => o.id !== data.orderId));
      };
      const handleStatusUpdate = (updateData) => {
        playNotificationSound();
        const { order, status } = updateData;
        if (status === 'ready') {
          setReadyOrders(prev => {
            const exists = prev.some(o => o.id === order.id);
            return exists ? prev.map(o => o.id === order.id ? order : o) : [order, ...prev];
          });
          setActiveOrders(prev => prev.filter(o => o.id !== order.id));
        } else if (['pending', 'preparing'].includes(status)) {
          setActiveOrders(prev => {
            const exists = prev.some(o => o.id === order.id);
            return exists ? prev.map(o => o.id === order.id ? order : o) : [order, ...prev];
          });
          setReadyOrders(prev => prev.filter(o => o.id !== order.id));
        } else {
          setReadyOrders(prev => prev.filter(o => o.id !== order.id));
          setActiveOrders(prev => prev.filter(o => o.id !== order.id));
        }
      };
      const handleOrderUpdate = (order) => {
        playNotificationSound();
        if (['pending', 'preparing'].includes(order.status)) {
          setActiveOrders(prev => {
            const exists = prev.some(o => o.id === order.id);
            return exists ? prev : [order, ...prev];
          });
        }
      };
      socket.on('order_ready', handleOrderReady);
      socket.on('status_update', handleStatusUpdate);
      socket.on('order_update', handleOrderUpdate);
      return () => {
        socket.off('order_ready', handleOrderReady);
        socket.off('status_update', handleStatusUpdate);
        socket.off('order_update', handleOrderUpdate);
      };
    }
  }, [socket, connected]);

  const fetchOrders = async () => {
    try {
      const [readyResponse, activeResponse] = await Promise.all([
        axios.get('/api/orders?status=ready'),
        axios.get('/api/orders?status=preparing,pending')
      ]);
      
      setReadyOrders(readyResponse.data);
      setActiveOrders(activeResponse.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const markAsServed = async (orderId) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: 'completed' });
      // State update is handled by the 'status_update' socket event
      toast.success(`Order #${orderId} marked as served`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getTimeElapsed = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const playNotificationSound = () => {
    try {
      const audio = new window.Audio('/notifications.mp3');
      audio.play();
    } catch (e) { /* ignore */ }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Waiter Dashboard</h1>
            <ConnectionStatus />
          </div>
          
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="orders">
                  <FaConciergeBell className="me-2" />
                  Orders ({readyOrders.length + activeOrders.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tables">
                  <FaTable className="me-2" />
                  Table Status
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="orders">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Order Management</h5>
                  <Button variant="outline-primary" onClick={fetchOrders}>
                    Refresh Orders
                  </Button>
                </div>

                <Row>
                  <Col md={6}>
                    <Card className="mb-4">
                      <Card.Header className="bg-warning text-white">
                        <h5 className="mb-0">
                          <FaUtensils className="me-2" />
                          Ready to Serve ({readyOrders.length})
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        {readyOrders.length > 0 ? (
                          <div className="space-y-3">
                            {readyOrders.map(order => (
                              <OrderCard 
                                key={order.id} 
                                order={order} 
                                onMarkServed={markAsServed}
                                getTimeElapsed={getTimeElapsed}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted">
                            <FaUtensils size={48} className="mb-3" />
                            <h6>No orders ready to serve</h6>
                            <p>Orders will appear here when they're ready from the kitchen.</p>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card>
                      <Card.Header className="bg-info text-white">
                        <h5 className="mb-0">
                          <FaClock className="me-2" />
                          Active Orders ({activeOrders.length})
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        {activeOrders.length > 0 ? (
                          <div className="space-y-3">
                            {activeOrders.map(order => (
                              <OrderCard 
                                key={order.id} 
                                order={order} 
                                onMarkServed={markAsServed}
                                getTimeElapsed={getTimeElapsed}
                                isActive={true}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted">
                            <FaClock size={48} className="mb-3" />
                            <h6>No active orders</h6>
                            <p>Orders will appear here when customers place them.</p>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="tables">
                <TableStatus />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

// Order Card Component
const OrderCard = ({ order, onMarkServed, getTimeElapsed, isActive = false }) => {
  return (
    <Card className="mb-3 border-left border-3 border-warning">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1">Order #{order.id}</h6>
            <small className="text-muted">
              <FaTable className="me-1" />
              Table {order.table_id}
            </small>
          </div>
          <Badge bg={isActive ? 'info' : 'success'}>
            {isActive ? 'Active' : 'Ready'}
          </Badge>
        </div>
        
        <div className="mb-2">
          <FaUsers className="me-2 text-muted" />
          <strong>{order.customer_name || 'Guest'}</strong>
        </div>
        
        <div className="mb-2">
          <small className="text-muted">Items:</small>
          <div>
            {order.items && order.items.map((item, index) => (
              <span key={index} className="badge bg-light text-dark me-1">
                {item.name} x{item.quantity}
              </span>
            ))}
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong className="text-primary">
              ₱{parseFloat(order.total_amount).toFixed(2)}
            </strong>
            <br />
            <small className="text-muted">
              <FaClock className="me-1" />
              {getTimeElapsed(order.created_at)}m ago
            </small>
          </div>
          {!isActive && (
            <Button 
              variant="success" 
              size="sm"
              onClick={() => onMarkServed(order.id)}
            >
              <FaCheckCircle className="me-1" />
              Mark Served
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default WaiterDashboard; 