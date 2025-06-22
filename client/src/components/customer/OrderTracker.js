import React, { useState, useEffect } from 'react';
import { Card, ProgressBar, Badge, Button } from 'react-bootstrap';
import { FaClock, FaUtensils, FaCheckCircle, FaTruck, FaBell } from 'react-icons/fa';

const OrderTracker = ({ orderId, tableId, socket }) => {
  const [orderStatus, setOrderStatus] = useState('pending');
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    
    if (socket && orderId) {
      const handleStatusUpdate = (updateData) => {
        if (updateData.orderId === orderId && updateData.status) {
          setOrderStatus(updateData.status);
        }
      };
      socket.on('status_update', handleStatusUpdate);
      return () => {
        socket.off('status_update', handleStatusUpdate);
      };
    }

    // Timer for elapsed time
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [orderId, socket]);

  const fetchOrderDetails = async () => {
    try {
      // Mock data - replace with API call
      setOrderDetails({
        id: orderId,
        table_id: tableId,
        items: [
          { name: 'Chicken Adobo', quantity: 2 },
          { name: 'Rice', quantity: 2 }
        ],
        total_amount: 450.00,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      setEstimatedTime(15); // 15 minutes
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const getStatusSteps = () => {
    return [
      { key: 'pending', label: 'Order Received', icon: FaClock, color: 'warning' },
      { key: 'preparing', label: 'Preparing', icon: FaUtensils, color: 'info' },
      { key: 'ready', label: 'Ready to Serve', icon: FaTruck, color: 'success' },
      { key: 'completed', label: 'Served', icon: FaCheckCircle, color: 'secondary' }
    ];
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    return steps.findIndex(step => step.key === orderStatus);
  };

  const getProgressPercentage = () => {
    const steps = getStatusSteps();
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const requestAssistance = () => {
    if (socket) {
      socket.emit('customer_request', {
        tableId: tableId,
        orderId: orderId,
        type: 'assistance'
      });
    }
  };

  if (!orderDetails) {
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

  const steps = getStatusSteps();
  const currentStepIndex = getCurrentStepIndex();

  return (
    <Card className="mb-3 p-2 p-md-3">
      <Card.Header>
        <h5 className="mb-0">
          <FaBell className="me-2" />
          Order Tracker - #{orderId}
        </h5>
      </Card.Header>
      <Card.Body>
        {/* Order Summary */}
        <div className="mb-4">
          <h6>Order Summary</h6>
          <div className="border rounded p-3">
            <div className="d-flex justify-content-between mb-2">
              <span>Table:</span>
              <strong>{orderDetails.table_id}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Items:</span>
              <strong>{orderDetails.items.length}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>Total:</span>
              <strong className="text-primary">₱{orderDetails.total_amount.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Status Progress */}
        <div className="mb-4">
          <h6>Order Status</h6>
          <ProgressBar 
            now={getProgressPercentage()} 
            className="mb-3"
            variant="success"
          />
          
          <div className="d-flex justify-content-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.key} className="text-center flex-fill">
                  <div className={`mb-2 ${isActive ? 'text-primary' : 'text-muted'}`}>
                    <Icon size={24} />
                  </div>
                  <div className="small">
                    <div className={`fw-bold ${isCurrent ? 'text-primary' : ''}`}>
                      {step.label}
                    </div>
                    {isCurrent && (
                      <Badge bg={step.color} className="mt-1">
                        Current
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Information */}
        <div className="row text-center flex-column flex-md-row">
          <div className="col-12 col-md-6 mb-2 mb-md-0">
            <div className="border rounded p-2">
              <div className="h6 mb-1">Time Elapsed</div>
              <div className="text-primary">{formatTime(timeElapsed)}</div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="border rounded p-2">
              <div className="h6 mb-1">Estimated Time</div>
              <div className="text-info">{estimatedTime} minutes</div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4">
          <h6>Order Items</h6>
          <div className="border rounded">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="d-flex justify-content-between align-items-center p-2 border-bottom">
                <div>
                  <strong>{item.name}</strong>
                  <br />
                  <small className="text-muted">Qty: {item.quantity}</small>
                </div>
                <Badge bg="light" text="dark">
                  {orderStatus === 'completed' ? 'Served' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="d-grid gap-2">
          <Button 
            variant="outline-primary" 
            onClick={requestAssistance}
            disabled={orderStatus === 'completed'}
            className="py-2 mt-2 w-100"
            aria-label="Request assistance from staff"
            style={{ minWidth: 44, minHeight: 44 }}
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