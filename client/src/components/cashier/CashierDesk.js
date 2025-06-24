import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import { FaClock, FaUser, FaTable, FaReceipt } from 'react-icons/fa';
import { SocketContext } from '../../contexts/SocketContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import PaymentModal from './PaymentModal';

const CashierDesk = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { socket, connected } = useContext(SocketContext);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders?status=PENDING');
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load pending orders.');
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (socket && connected) {
      socket.emit('join_room', 'cashier_updates');

      const handleNewOrder = (orderData) => {
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
        
        toast.info(`New order #${orderData.id} received!`);
        setOrders(prevOrders => [orderData, ...prevOrders]);
      };

      const handleOrderStatusUpdate = (update) => {
         if (update.status === 'PAID') {
           toast.success(`Order #${update.order_id} was paid.`);
           setOrders(prevOrders => prevOrders.filter(o => o.id !== update.order_id));
         }
      };

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

      socket.on('new_order', handleNewOrder);
      socket.on('order_status_update', handleOrderStatusUpdate);
      socket.on('assistance_request', handleAssistanceRequest);

      return () => {
        socket.off('new_order', handleNewOrder);
        socket.off('order_status_update', handleOrderStatusUpdate);
        socket.off('assistance_request', handleAssistanceRequest);
        socket.emit('leave_room', 'cashier_updates');
      };
    }
  }, [socket, connected]);

  const handlePayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };
  
  const handlePaymentComplete = async (paymentData) => {
    try {
      let paymentMethodBE = paymentData.paymentMethod.toUpperCase();
      if (paymentMethodBE === 'GCASH') {
        paymentMethodBE = 'DIGITAL_WALLET';
      }

      const payload = {
        order_id: paymentData.orderId,
        payment_method: paymentMethodBE,
        amount_paid: paymentData.amountReceived,
        change_amount: paymentData.change,
      };

      const response = await axios.post('/api/sales', payload);

      if (response.data.success) {
        toast.success(`Payment for Order #${paymentData.orderId} recorded.`);
        fetchOrders(); // Refresh the list of pending orders
        return true; // Signal success
      } else {
        toast.error(response.data.message || 'Failed to record transaction.');
        return false; // Signal failure
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete payment.');
      console.error("Payment submission failed:", error);
      return false; // Signal failure
    }
  };

  if (loading) return <div className="text-center mt-5"><h5>Loading Pending Orders...</h5></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Cashier Desk</h2>
        <Button variant="outline-primary" onClick={fetchOrders}>
          Refresh Orders
        </Button>
      </div>
      
      {orders.length > 0 ? (
        <Row>
          {orders.map(order => (
        <Col key={order.id} xs={12} md={6} lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
              <strong className="text-primary">Order #{order.id}</strong>




                  <small className="text-muted">
                    <FaClock className="me-1" />
                    {new Date(order.created_at).toLocaleTimeString()}
                  </small>




                  </Card.Header>
            <Card.Body>
              <div className="mb-2"><FaUser className="me-2 text-muted" />{order.customer_name || 'Walk-in'}</div>
              <div className="mb-3"><FaTable className="me-2 text-muted" />Table {order.table_number || 'N/A'}</div>
              <h6>Items:</h6>
              <ListGroup variant="flush" style={{maxHeight: '150px', overflowY: 'auto'}} className="mb-3">
                {order.order_items?.map((item, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center py-2">
                    <div>{item.product_name} <small className="text-muted">x{item.quantity}</small></div>


                        <span className="fw-bold">₱{parseFloat(item.subtotal).toFixed(2)}</span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <strong className="h5">Total: ₱{parseFloat(order.total_amount).toFixed(2)}</strong>
                    <Button variant="success" onClick={() => handlePayment(order)}>
                      <FaReceipt className="me-2" />
                      Process Payment
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="text-center py-5 bg-light">
          <Card.Body>
              <FaReceipt size={40} className="text-muted mb-3" />
              <h4>No Pending Payments</h4>
              <p className="text-muted">New orders that are ready for payment will appear here automatically.</p>
          </Card.Body>
        </Card>
      )}

      {selectedOrder && (
        <PaymentModal
          show={showPaymentModal}
          handleClose={() => setShowPaymentModal(false)}
          order={selectedOrder}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default CashierDesk;