import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button, Nav, Tab } from 'react-bootstrap';
import { SocketContext } from '../contexts/SocketContext';
import { FaClock, FaUser, FaTable, FaMoneyBill, FaReceipt, FaHistory, FaCashRegister } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import PaymentModal from '../components/cashier/PaymentModal';
import TransactionHistory from '../components/cashier/TransactionHistory';
import ConnectionStatus from '../components/common/ConnectionStatus';

const CashierDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const { socket, connected, connecting } = useContext(SocketContext);

  useEffect(() => {
    fetchOrders();
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (socket && connected) {
      socket.emit('join_room', 'cashier');
      
      const playNotificationSound = () => {
        try {
          const audio = new window.Audio('/notifications.mp3');
          audio.play();
        } catch (e) { /* ignore */ }
      };

      const handleOrderUpdate = (orderData) => {
        playNotificationSound();
        setOrders(prevOrders => {
          const orderExists = prevOrders.some(o => o.id === orderData.id);
          if (orderExists) {
            return prevOrders.map(o => o.id === orderData.id ? orderData : o);
          }
          return [orderData, ...prevOrders];
        });
      };

      const handleStatusUpdate = (updateData) => {
        playNotificationSound();
        const { orderId, status, order } = updateData;
        if (['paid', 'completed', 'cancelled'].includes(status)) {
          setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
          fetchTransactions();
        } else {
          setOrders(prevOrders => {
            const exists = prevOrders.some(o => o.id === orderId);
            if (exists) {
              return prevOrders.map(o => o.id === orderId ? order : o);
            }
            // If the order is not in the list and its status is live, add it
            return [order, ...prevOrders];
          });
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
      const response = await axios.get('/api/orders?status=pending,preparing,ready');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load live orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        toast.success(`Order #${orderId} status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handlePayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (paymentData) => {
    try {
      const transactionPayload = {
        order_id: paymentData.orderId,
        payment_method: paymentData.paymentMethod,
        amount_received: paymentData.amountReceived,
        change: paymentData.change,
      };

      const response = await axios.post('/api/transactions', transactionPayload);

      if (response.data.success) {
        toast.success(`Payment completed for Order #${paymentData.orderId}`);
        // Refresh both orders and transactions to reflect the changes
        fetchOrders();
        fetchTransactions();
      } else {
        toast.error('Failed to record transaction');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete payment');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      case 'completed': return 'secondary';
      case 'paid': return 'success';
      case 'cancelled': return 'danger';
      default: return 'primary';
    }
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
            <h1>Cashier Dashboard</h1>
            <ConnectionStatus />
          </div>
          
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="orders">
                  <FaClock className="me-2" />
                  Live Orders ({orders.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="transactions">
                  <FaHistory className="me-2" />
                  Transaction History
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="orders">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Live Orders</h5>
                  <Button variant="outline-primary" onClick={fetchOrders}>
                    Refresh
                  </Button>
                </div>
                
                {orders.length > 0 ? (
                  <Row>
                    {orders.map(order => (
                      <Col key={order.id} xs={12} md={6} lg={4} className="mb-3">
                        <Card className="h-100 shadow-sm">
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
                            <small className="text-muted">
                              <FaClock className="me-1" />
                              {new Date(order.created_at).toLocaleTimeString()}
                            </small>
                          </Card.Header>
                          <Card.Body>
                            <div className="mb-2">
                              <FaUser className="me-2 text-muted" />
                              <strong>{order.customer_name || 'Guest'}</strong>
                            </div>
                            <div className="mb-3">
                              <FaTable className="me-2 text-muted" />
                              <strong>Table {order.table_id}</strong>
                            </div>
                            
                            <h6>Items:</h6>
                            <ListGroup variant="flush" className="mb-3">
                              {order.items && order.items.map((item, index) => (
                                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center py-1">
                                  <div>
                                    <strong>{item.name}</strong>
                                    <br />
                                    <small className="text-muted">Qty: {item.quantity}</small>
                                  </div>
                                  <span className="text-primary">
                                    ₱{parseFloat(item.subtotal).toFixed(2)}
                                  </span>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                            
                            <div className="d-flex justify-content-between align-items-center border-top pt-2">
                              <div>
                                <FaMoneyBill className="me-2 text-success" />
                                <strong>Total: ₱{parseFloat(order.total_amount).toFixed(2)}</strong>
                              </div>
                              <div className="btn-group btn-group-sm">
                                {order.status === 'ready' && (
                                  <Button 
                                    variant="success" 
                                    size="sm"
                                    onClick={() => handlePayment(order)}
                                  >
                                    <FaCashRegister className="me-1" />
                                    Process Payment
                                  </Button>
                                )}
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'completed')}
                                  disabled={order.status === 'completed'}
                                >
                                  Complete
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Card>
                    <Card.Body className="text-center text-muted">
                      <FaClock size={48} className="mb-3" />
                      <h5>No active orders</h5>
                      <p>Orders will appear here in real-time when customers place them.</p>
                    </Card.Body>
                  </Card>
                )}
              </Tab.Pane>

              <Tab.Pane eventKey="transactions">
                <TransactionHistory />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>

      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        order={selectedOrder}
        onPaymentComplete={handlePaymentComplete}
      />
    </Container>
  );
};

export default CashierDashboard; 