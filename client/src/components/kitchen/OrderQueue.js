import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, ProgressBar, Alert, ListGroup } from 'react-bootstrap';
import { FaClock, FaUtensils, FaCheckCircle, FaTimesCircle, FaPause, FaPlay } from 'react-icons/fa';

// Helper functions moved outside component
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'preparing': return 'info';
    case 'ready': return 'success';
    case 'completed': return 'secondary';
    case 'cancelled': return 'danger';
    default: return 'light';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'danger';
    case 'normal': return 'warning';
    case 'low': return 'success';
    default: return 'secondary';
  }
};

const getProgressPercentage = (elapsed, estimated) => {
  return Math.min((elapsed / estimated) * 100, 100);
};

const getTimeRemaining = (elapsed, estimated) => {
  const remaining = estimated - elapsed;
  return remaining > 0 ? remaining : 0;
};

const isOverdue = (elapsed, estimated) => {
  return elapsed > estimated;
};

const OrderQueue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (socket) {
      const handleOrderUpdate = (order) => {
        setOrders(prevOrders => {
          const exists = prevOrders.find(o => o.id === order.id);
          if (!exists) {
            return [order, ...prevOrders];
          }
          return prevOrders;
        });
      };
      const handleStatusUpdate = (updateData) => {
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
  }, [socket]);

  const fetchOrders = async () => {
    try {
      // Mock data - replace with API call
      const mockOrders = [
        {
          id: 101,
          table_id: 5,
          customer_name: 'John Doe',
          items: [
            { name: 'Chicken Adobo', quantity: 2, notes: 'Extra spicy' },
            { name: 'Sinigang na Baboy', quantity: 1, notes: '' },
            { name: 'Rice', quantity: 3, notes: '' }
          ],
          total_amount: 1250.00,
          status: 'preparing',
          priority: 'high',
          order_time: '2024-01-15T14:30:00',
          estimated_time: 15,
          time_elapsed: 8
        },
        {
          id: 102,
          table_id: 3,
          customer_name: 'Jane Smith',
          items: [
            { name: 'Kare-kare', quantity: 1, notes: 'No peanuts' },
            { name: 'Rice', quantity: 2, notes: '' }
          ],
          total_amount: 890.00,
          status: 'pending',
          priority: 'normal',
          order_time: '2024-01-15T15:45:00',
          estimated_time: 12,
          time_elapsed: 2
        },
        {
          id: 103,
          table_id: 7,
          customer_name: 'Mike Johnson',
          items: [
            { name: 'Lumpia', quantity: 1, notes: '' },
            { name: 'Chicken Adobo', quantity: 1, notes: 'Mild spice' },
            { name: 'Halo-halo', quantity: 1, notes: 'Extra ice' },
            { name: 'Rice', quantity: 2, notes: '' }
          ],
          total_amount: 2100.00,
          status: 'ready',
          priority: 'high',
          order_time: '2024-01-15T16:20:00',
          estimated_time: 18,
          time_elapsed: 15
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // API call to update order status
      console.log(`Updating order ${orderId} to ${newStatus}`);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const readyOrders = orders.filter(order => order.status === 'ready');

  return (
    <div>
      {/* Order Summary */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center bg-warning text-white">
            <Card.Body>
              <h4>{pendingOrders.length}</h4>
              <p className="mb-0">Pending Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-info text-white">
            <Card.Body>
              <h4>{preparingOrders.length}</h4>
              <p className="mb-0">Preparing</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-success text-white">
            <Card.Body>
              <h4>{readyOrders.length}</h4>
              <p className="mb-0">Ready to Serve</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-primary text-white">
            <Card.Body>
              <h4>{orders.length}</h4>
              <p className="mb-0">Total Orders</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Order Queue */}
      <Row>
        {/* Pending Orders */}
        <Col md={4}>
          <Card>
            <Card.Header className="bg-warning text-white">
              <h6 className="mb-0">
                <FaClock className="me-2" />
                Pending ({pendingOrders.length})
              </h6>
            </Card.Header>
            <Card.Body className="p-2">
              {pendingOrders.length > 0 ? (
                pendingOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusUpdate={updateOrderStatus}
                    onSelect={setSelectedOrder}
                  />
                ))
              ) : (
                <div className="text-center text-muted py-3">
                  No pending orders
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Preparing Orders */}
        <Col md={4}>
          <Card>
            <Card.Header className="bg-info text-white">
              <h6 className="mb-0">
                <FaUtensils className="me-2" />
                Preparing ({preparingOrders.length})
              </h6>
            </Card.Header>
            <Card.Body className="p-2">
              {preparingOrders.length > 0 ? (
                preparingOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusUpdate={updateOrderStatus}
                    onSelect={setSelectedOrder}
                  />
                ))
              ) : (
                <div className="text-center text-muted py-3">
                  No orders being prepared
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Ready Orders */}
        <Col md={4}>
          <Card>
            <Card.Header className="bg-success text-white">
              <h6 className="mb-0">
                <FaCheckCircle className="me-2" />
                Ready ({readyOrders.length})
              </h6>
            </Card.Header>
            <Card.Body className="p-2">
              {readyOrders.length > 0 ? (
                readyOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusUpdate={updateOrderStatus}
                    onSelect={setSelectedOrder}
                  />
                ))
              ) : (
                <div className="text-center text-muted py-3">
                  No orders ready
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={updateOrderStatus}
        />
      )}
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order, onStatusUpdate, onSelect }) => {
  const progressPercentage = getProgressPercentage(order.time_elapsed, order.estimated_time);
  const timeRemaining = getTimeRemaining(order.time_elapsed, order.estimated_time);
  const isOverdueOrder = isOverdue(order.time_elapsed, order.estimated_time);

  return (
    <Card 
      className={`mb-2 cursor-pointer ${isOverdueOrder ? 'border-danger' : ''}`}
      onClick={() => onSelect(order)}
    >
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1">Order #{order.id}</h6>
            <small className="text-muted">Table {order.table_id}</small>
          </div>
          <Badge bg={getPriorityColor(order.priority)}>
            {order.priority}
          </Badge>
        </div>
        
        <div className="mb-2">
          <small className="text-muted">{order.customer_name}</small>
        </div>
        
        <div className="mb-2">
          <small className="text-muted">
            {order.items.length} items • ₱{order.total_amount.toFixed(2)}
          </small>
        </div>

        {order.status === 'preparing' && (
          <div className="mb-2">
            <small className="text-muted d-block mb-1">
              {order.time_elapsed}/{order.estimated_time} min
            </small>
            <ProgressBar 
              now={progressPercentage} 
              variant={isOverdueOrder ? 'danger' : 'info'}
              size="sm"
            />
          </div>
        )}

        <div className="d-flex gap-1">
          {order.status === 'pending' && (
            <Button 
              size="sm" 
              variant="outline-info"
              onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate(order.id, 'preparing');
              }}
            >
              <FaPlay />
            </Button>
          )}
          
          {order.status === 'preparing' && (
            <>
              <Button 
                size="sm" 
                variant="outline-success"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusUpdate(order.id, 'ready');
                }}
              >
                <FaCheckCircle />
              </Button>
              <Button 
                size="sm" 
                variant="outline-warning"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusUpdate(order.id, 'pending');
                }}
              >
                <FaPause />
              </Button>
            </>
          )}
          
          <Button 
            size="sm" 
            variant="outline-danger"
            onClick={(e) => {
              e.stopPropagation();
              onStatusUpdate(order.id, 'cancelled');
            }}
          >
            <FaTimesCircle />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

// Order Detail Modal Component
const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Order #{order.id} Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <Row>
              <Col md={6}>
                <h6>Order Information</h6>
                <p><strong>Customer:</strong> {order.customer_name}</p>
                <p><strong>Table:</strong> {order.table_id}</p>
                <p><strong>Status:</strong> 
                  <Badge bg={getStatusColor(order.status)} className="ms-2">
                    {order.status}
                  </Badge>
                </p>
                <p><strong>Priority:</strong> 
                  <Badge bg={getPriorityColor(order.priority)} className="ms-2">
                    {order.priority}
                  </Badge>
                </p>
                <p><strong>Total:</strong> ₱{order.total_amount.toFixed(2)}</p>
              </Col>
              <Col md={6}>
                <h6>Order Items</h6>
                <ListGroup>
                  {order.items.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{item.name}</strong>
                          <br />
                          <small className="text-muted">Qty: {item.quantity}</small>
                          {item.notes && (
                            <>
                              <br />
                              <small className="text-warning">Note: {item.notes}</small>
                            </>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
            </Row>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderQueue; 