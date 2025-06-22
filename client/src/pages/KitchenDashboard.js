import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge, Nav, Tab } from 'react-bootstrap';
import { SocketContext } from '../contexts/SocketContext';
import { FaUtensils, FaClock, FaCheckCircle, FaTimesCircle, FaChartBar, FaCog } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import OrderQueue from '../components/kitchen/OrderQueue';
import ConnectionStatus from '../components/common/ConnectionStatus';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [kitchenStats, setKitchenStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    averageTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue');
  const { socket, connected } = useContext(SocketContext);

  useEffect(() => {
    fetchOrders();
    fetchKitchenStats();
  }, []);

  useEffect(() => {
    if (socket && connected) {
      // Join kitchen room for real-time updates
      socket.emit('join_room', 'kitchen');
      // Listen for new orders
      const handleOrderUpdate = (newOrder) => {
        playNotificationSound();
        setOrders(prevOrders => {
          const exists = prevOrders.find(order => order.id === newOrder.id);
          if (!exists) {
            toast.success(`New order #${newOrder.id} received from Table ${newOrder.table_id}!`);
            return [newOrder, ...prevOrders];
          }
          return prevOrders;
        });
      };
      // Listen for order status updates
      const handleStatusUpdate = (updateData) => {
        playNotificationSound();
        const { order, status } = updateData;
        if (['pending', 'preparing'].includes(status)) {
          setOrders(prevOrders => {
            const exists = prevOrders.some(o => o.id === order.id);
            if (exists) {
              return prevOrders.map(o => o.id === order.id ? order : o);
            }
            return [order, ...prevOrders];
          });
        } else {
          setOrders(prevOrders => prevOrders.filter(o => o.id !== order.id));
        }
      };
      socket.on('order_update', handleOrderUpdate);
      socket.on('status_update', handleStatusUpdate);
      return () => {
        socket.off('order_update', handleOrderUpdate);
        socket.off('status_update', handleStatusUpdate);
      };
    }
  }, [socket, connected]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders?status=pending,preparing');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchKitchenStats = async () => {
    try {
      const response = await axios.get('/api/kitchen/stats');
      setKitchenStats(response.data);
    } catch (error) {
      console.error('Failed to fetch kitchen stats:', error);
      toast.error('Failed to load kitchen stats');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      // The socket event will handle the state update
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      case 'completed': return 'secondary';
      case 'cancelled': return 'danger';
      default: return 'primary';
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
            <h1>Kitchen Dashboard</h1>
            <ConnectionStatus />
          </div>
          
          <Row>
            {orders.length > 0 ? (
              orders.map(order => (
                <Col key={order.id} xs={12} md={6} lg={4} className="mb-3">
                  <Card className="h-100 shadow-sm order-card">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Order #{order.id}</strong>
                        <Badge 
                          bg={getStatusBadgeColor(order.status)} 
                          className="ms-2"
                        >
                          {order.status || 'Pending'}
                        </Badge>
                      </div>
                      <div className="text-muted">
                        <FaClock className="me-1" />
                        {getTimeElapsed(order.created_at)}m ago
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Table {order.table_id}</strong>
                        {order.customer_name && (
                          <span className="text-muted ms-2">- {order.customer_name}</span>
                        )}
                      </div>
                      
                      <h6>Items:</h6>
                      <div className="mb-3">
                        {order.items && order.items.map((item, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                            <div>
                              <strong>{item.name}</strong>
                              <br />
                              <small className="text-muted">Qty: {item.quantity}</small>
                            </div>
                            <span className="text-primary">
                              ₱{parseFloat(item.subtotal).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center border-top pt-2">
                        <div>
                          <strong>Total: ₱{parseFloat(order.total_amount).toFixed(2)}</strong>
                        </div>
                        <div className="btn-group btn-group-sm">
                          {order.status === 'pending' && (
                            <Button 
                              variant="outline-info" 
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                            >
                              Start Preparing
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                            >
                              <FaCheckCircle className="me-1" />
                              Ready
                            </Button>
                          )}
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            disabled={order.status === 'ready' || order.status === 'completed'}
                          >
                            <FaTimesCircle className="me-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <Card>
                  <Card.Body className="text-center text-muted">
                    <FaUtensils size={48} className="mb-3" />
                    <h5>No pending orders</h5>
                    <p>Orders will appear here in real-time when customers place them.</p>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default KitchenDashboard; 