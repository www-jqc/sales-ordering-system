import React, { useState, useEffect } from 'react';
import { Card, ProgressBar, Badge, Button } from 'react-bootstrap';
import { FaClock, FaMoneyBillWave, FaUtensils, FaCheckCircle, FaBell } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderTracker = ({ orderId, socket, onOrderComplete }) => {
  const [orderStatus, setOrderStatus] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
    fetchOrderDetails();
    }
  }, [orderId]);

  useEffect(() => {
    if (socket && orderId) {
      const handleStatusUpdate = (updateData) => {
        if (updateData.order_id === orderId && updateData.status) {
          toast.info(`Your order is now ${updateData.status}!`);
          setOrderStatus(updateData.status);
          if (updateData.status === 'DELIVERED') {
            onOrderComplete();
          }
        }
      };
      socket.on('order_status_update', handleStatusUpdate);
      return () => {
        socket.off('order_status_update', handleStatusUpdate);
      };
    }
  }, [orderId, socket, onOrderComplete]);

  useEffect(() => {
    // Timer for elapsed time
    const interval = setInterval(() => {
      if (orderDetails) {
        const created = new Date(orderDetails.created_at);
        const now = new Date();
        setTimeElapsed(Math.floor((now - created) / 1000));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [orderDetails]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setOrderDetails(response.data);
      setOrderStatus(response.data.status);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error('Could not load order details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    return [
      { key: 'PENDING', label: 'Order Placed', icon: FaClock, color: 'warning' },
      { key: 'PAID', label: 'Payment Confirmed', icon: FaMoneyBillWave, color: 'info' },
      { key: 'COMPLETED', label: 'Ready to Serve', icon: FaUtensils, color: 'primary' },
      { key: 'DELIVERED', label: 'Delivered', icon: FaCheckCircle, color: 'success' }
    ];
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    const upperCaseStatus = orderStatus?.toUpperCase();
    return steps.findIndex(step => step.key === upperCaseStatus);
  };

  const getProgressPercentage = () => {
    const steps = getStatusSteps();
    const currentIndex = getCurrentStepIndex();
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const requestAssistance = () => {
    if (socket) {
      socket.emit('customer_request', {
        table_id: orderDetails.table.table_id,
        order_id: orderId,
        message: `Assistance requested at Table ${orderDetails.table.table_number}.`
      });
      toast.success("Staff has been notified for assistance.");
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  if (!orderDetails) {
    return (
      <Card>
        <Card.Body className="text-center text-muted">
          <p>No active order to track.</p>
        </Card.Body>
      </Card>
    )
  }

  const steps = getStatusSteps();
  const currentStepIndex = getCurrentStepIndex();

  return (
    <Card className="mb-3 p-2 p-md-3 shadow-sm">
      <Card.Header>
        <h5 className="mb-0">
          <FaBell className="me-2" />
          Order Tracker - #{orderId}
        </h5>
      </Card.Header>
      <Card.Body>
        {/* Status Progress */}
        <div className="mb-4">
          <h6 className="text-center">Your order is {orderStatus}</h6>
          <ProgressBar 
            now={getProgressPercentage()} 
            className="mb-3"
            variant="success"
            style={{height: '10px'}}
          />
          
          <div className="d-flex justify-content-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              
              return (
                <div key={step.key} className="text-center flex-fill">
                  <div className={`mb-2 p-2 rounded-circle d-inline-block ${isActive ? 'bg-success text-white' : 'bg-light'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="small">
                    <div className={`fw-bold ${isActive ? 'text-dark' : 'text-muted'}`}>
                      {step.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-4">
          <h6>Your Items:</h6>
          <ul className="list-unstyled">
            {orderDetails.order_items.map(item => (
              <li key={item.id} className="d-flex align-items-center mb-2 p-2 bg-light rounded">
                <img 
                  src={item.product_image_url || 'https://via.placeholder.com/64'} 
                  alt={item.product_name} 
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} 
                  className="me-3"
                />
                <div className="flex-grow-1">
                  <div className="fw-bold">{item.product_name}</div>
                  <div className="text-muted small">
                    {item.quantity} x ₱{parseFloat(item.unit_price).toFixed(2)}
                  </div>
                </div>
                <div className="fw-bold">
                  ₱{parseFloat(item.subtotal).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Time and Details */}
        <div className="row text-center">
          <div className="col-6">
            <div className="border rounded p-2 h-100">
              <div className="h6 mb-1">Time Elapsed</div>
              <div className="text-primary fw-bold">{formatTime(timeElapsed)}</div>
            </div>
          </div>
          <div className="col-6">
            <div className="border rounded p-2 h-100">
              <div className="h6 mb-1">Total Amount</div>
              <div className="text-success fw-bold">₱{parseFloat(orderDetails.total_amount).toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="d-grid gap-2 mt-4">
          <Button 
            variant="outline-secondary" 
            onClick={requestAssistance}
            disabled={orderStatus === 'DELIVERED'}
            className="py-2"
          >
            <FaBell className="me-2" />
            Request Assistance
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default OrderTracker; 