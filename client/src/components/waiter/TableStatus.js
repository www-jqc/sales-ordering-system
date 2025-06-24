import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Badge, Button, Modal, ListGroup } from 'react-bootstrap';
import { FaTable, FaUsers, FaClock, FaCheckCircle, FaTimesCircle, FaBell } from 'react-icons/fa';
import { SocketContext } from '../../contexts/SocketContext';
import { toast } from 'react-toastify';

const TableStatus = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotificationBell, setShowNotificationBell] = useState(false);
  const [customerRequests, setCustomerRequests] = useState([]);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    fetchTableStatus();
    const interval = setInterval(fetchTableStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (socket) {
      // Join waiter room for notifications
      socket.emit('join_room', 'waiter_updates');
      
      // Listen for customer assistance requests
      socket.on('assistance_request', (requestData) => {
        playNotificationSound();
        showNotificationIndicator();
        addCustomerRequest(requestData);
        toast.info(`Customer at Table ${requestData.tableId} needs assistance!`);
      });

      // Listen for new orders
      socket.on('new_order', (orderData) => {
        playNotificationSound();
        showNotificationIndicator();
        toast.info(`New order #${orderData.id} received from Table ${orderData.table_id}!`);
      });

      return () => {
        socket.off('assistance_request');
        socket.off('new_order');
        socket.emit('leave_room', 'waiter_updates');
      };
    }
  }, [socket]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notifications.mp3');
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch(err => {
        console.log('Could not play notification sound:', err);
      });
    } catch (error) {
      console.log('Error creating audio element:', error);
    }
  };

  const showNotificationIndicator = () => {
    setShowNotificationBell(true);
    
    // Hide notification bell after 8 seconds
    setTimeout(() => {
      setShowNotificationBell(false);
    }, 8000);
  };

  const addCustomerRequest = (requestData) => {
    setCustomerRequests(prev => [requestData, ...prev.slice(0, 4)]); // Keep only last 5 requests
  };

  const fetchTableStatus = async () => {
    try {
      // Mock data - replace with API call
      const mockTables = [
        {
          id: 1,
          table_number: 'T1',
          capacity: 4,
          status: 'occupied',
          current_order: {
            id: 101,
            customer_name: 'John Doe',
            items: 3,
            total_amount: 1250.00,
            order_time: '2024-01-15T14:30:00',
            status: 'ready'
          }
        },
        {
          id: 2,
          table_number: 'T2',
          capacity: 6,
          status: 'available',
          current_order: null
        },
        {
          id: 3,
          table_number: 'T3',
          capacity: 2,
          status: 'occupied',
          current_order: {
            id: 102,
            customer_name: 'Jane Smith',
            items: 2,
            total_amount: 890.00,
            order_time: '2024-01-15T15:45:00',
            status: 'preparing'
          }
        },
        {
          id: 4,
          table_number: 'T4',
          capacity: 4,
          status: 'reserved',
          current_order: null
        },
        {
          id: 5,
          table_number: 'T5',
          capacity: 8,
          status: 'occupied',
          current_order: {
            id: 103,
            customer_name: 'Mike Johnson',
            items: 4,
            total_amount: 2100.00,
            order_time: '2024-01-15T16:20:00',
            status: 'ready'
          }
        }
      ];
      
      setTables(mockTables);
    } catch (error) {
      console.error('Failed to fetch table status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'warning';
      case 'reserved': return 'info';
      case 'cleaning': return 'secondary';
      default: return 'light';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <FaCheckCircle className="text-success" />;
      case 'occupied': return <FaUsers className="text-warning" />;
      case 'reserved': return <FaClock className="text-info" />;
      case 'cleaning': return <FaTimesCircle className="text-secondary" />;
      default: return <FaTable />;
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'ready': return <Badge bg="success">Ready to Serve</Badge>;
      case 'preparing': return <Badge bg="info">Preparing</Badge>;
      case 'pending': return <Badge bg="warning">Pending</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setShowModal(true);
  };

  const markAsServed = async (orderId) => {
    try {
      // API call to mark order as served
      console.log(`Marking order ${orderId} as served`);
      
      // Update local state
      setTables(prevTables => 
        prevTables.map(table => 
          table.current_order?.id === orderId 
            ? { ...table, current_order: { ...table.current_order, status: 'served' } }
            : table
        )
      );
      
      setShowModal(false);
    } catch (error) {
      console.error('Failed to mark as served:', error);
    }
  };

  const getTimeElapsed = (orderTime) => {
    const now = new Date();
    const order = new Date(orderTime);
    const diffMs = now - order;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  if (loading) {
    return (
      <div className="loading-mobile">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading table status...</p>
      </div>
    );
  }

  return (
    <>
      {/* Notification Bell Indicator */}
      {showNotificationBell && (
        <div className="notification-bell-mobile">
          <div className="position-relative">
            <div className="text-warning fs-2 animate-pulse">
              🔔
            </div>
            <Badge 
              bg="danger" 
              className="position-absolute top-0 start-100 translate-middle animate-bounce"
              style={{ fontSize: '0.8rem' }}
            >
              !
            </Badge>
          </div>
        </div>
      )}

      {/* Mobile Summary Cards */}
      <div className="d-lg-none mb-4">
        <div className="row g-2">
          <div className="col-6">
            <Card className="text-center py-3 bg-success text-white summary-card">
              <Card.Body className="p-2">
                <div className="h6 mb-1 h6-mobile">Available</div>
                <div className="h4 mb-0">{tables.filter(t => t.status === 'available').length}</div>
              </Card.Body>
            </Card>
          </div>
          <div className="col-6">
            <Card className="text-center py-3 bg-warning text-white summary-card">
              <Card.Body className="p-2">
                <div className="h6 mb-1 h6-mobile">Occupied</div>
                <div className="h4 mb-0">{tables.filter(t => t.status === 'occupied').length}</div>
              </Card.Body>
            </Card>
          </div>
          <div className="col-6">
            <Card className="text-center py-3 bg-info text-white summary-card">
              <Card.Body className="p-2">
                <div className="h6 mb-1 h6-mobile">Reserved</div>
                <div className="h4 mb-0">{tables.filter(t => t.status === 'reserved').length}</div>
              </Card.Body>
            </Card>
          </div>
          <div className="col-6">
            <Card className="text-center py-3 bg-secondary text-white summary-card">
              <Card.Body className="p-2">
                <div className="h6 mb-1 h6-mobile">Cleaning</div>
                <div className="h4 mb-0">{tables.filter(t => t.status === 'cleaning').length}</div>
              </Card.Body>
            </Card>
          </div>
        </div>
        {customerRequests.length > 0 && (
          <Card className="mt-3 bg-danger text-white summary-card">
            <Card.Body className="py-2 text-center">
              <FaBell className="me-2" />
              Customer Requests: {customerRequests.length}
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Desktop Summary */}
      <div className="d-none d-lg-block mb-4">
        <h4>Table Status Overview</h4>
        <div className="d-flex gap-3">
          <Badge bg="success" className="p-2">
            Available: {tables.filter(t => t.status === 'available').length}
          </Badge>
          <Badge bg="warning" className="p-2">
            Occupied: {tables.filter(t => t.status === 'occupied').length}
          </Badge>
          <Badge bg="info" className="p-2">
            Reserved: {tables.filter(t => t.status === 'reserved').length}
          </Badge>
          <Badge bg="secondary" className="p-2">
            Cleaning: {tables.filter(t => t.status === 'cleaning').length}
          </Badge>
          {customerRequests.length > 0 && (
            <Badge bg="danger" className="p-2">
              <FaBell className="me-1" />
              Requests: {customerRequests.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Tables Grid */}
      <Row className="g-3">
        {tables.map(table => (
          <Col key={table.id} xs={6} sm={4} md={3} lg={2} xl={2}>
            <Card 
              className={`h-100 cursor-pointer shadow-sm ${table.current_order?.status === 'ready' ? 'border-warning border-3' : ''}`}
              onClick={() => handleTableClick(table)}
            >
              <Card.Body className="text-center p-3">
                <div className="mb-2">
                  {getStatusIcon(table.status)}
                </div>
                <Card.Title className="h6 mb-1 h6-mobile">
                  Table {table.table_number}
                </Card.Title>
                <Card.Text className="text-muted small mb-2 small-mobile">
                  {table.capacity} persons
                </Card.Text>
                
                <Badge bg={getStatusColor(table.status)} className="mb-2">
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </Badge>

                {table.current_order && (
                  <div className="mt-2">
                    <small className="text-muted d-block small-mobile">
                      {table.current_order.customer_name}
                    </small>
                    <small className="text-muted d-block small-mobile">
                      {table.current_order.items} items
                    </small>
                    <small className="text-muted d-block small-mobile">
                      {getTimeElapsed(table.current_order.order_time)}m ago
                    </small>
                    <div className="mt-2">
                      {getOrderStatusBadge(table.current_order.status)}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" dialogClassName="modal-fullscreen-sm-down">
        <Modal.Header closeButton>
          <Modal.Title>
            Table {selectedTable?.table_number} Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTable && (
            <div>
              <Row>
                <Col md={6}>
                  <h6 className="h6-mobile">Table Information</h6>
                  <ListGroup>
                    <ListGroup.Item>
                      <strong>Table Number:</strong> {selectedTable.table_number}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Capacity:</strong> {selectedTable.capacity} persons
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Status:</strong> 
                      <Badge bg={getStatusColor(selectedTable.status)} className="ms-2">
                        {selectedTable.status}
                      </Badge>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                
                {selectedTable.current_order && (
                  <Col md={6}>
                    <h6 className="h6-mobile">Current Order</h6>
                    <ListGroup>
                      <ListGroup.Item>
                        <strong>Order #:</strong> {selectedTable.current_order.id}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Customer:</strong> {selectedTable.current_order.customer_name}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Items:</strong> {selectedTable.current_order.items}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Total:</strong> ₱{selectedTable.current_order.total_amount.toFixed(2)}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Status:</strong> {getOrderStatusBadge(selectedTable.current_order.status)}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Time:</strong> {getTimeElapsed(selectedTable.current_order.order_time)} minutes ago
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selectedTable?.current_order?.status === 'ready' && (
            <Button 
              variant="success" 
              onClick={() => markAsServed(selectedTable.current_order.id)}
            >
              <FaCheckCircle className="me-2" />
              Mark as Served
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TableStatus; 