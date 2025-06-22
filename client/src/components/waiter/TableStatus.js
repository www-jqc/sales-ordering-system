import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Modal, ListGroup } from 'react-bootstrap';
import { FaTable, FaUsers, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const TableStatus = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTableStatus();
    const interval = setInterval(fetchTableStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

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
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
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
        </div>
      </div>

      <Row>
        {tables.map(table => (
          <Col key={table.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
            <Card 
              className={`h-100 cursor-pointer ${table.current_order?.status === 'ready' ? 'border-warning' : ''}`}
              onClick={() => handleTableClick(table)}
            >
              <Card.Body className="text-center">
                <div className="mb-2">
                  {getStatusIcon(table.status)}
                </div>
                <Card.Title className="h5 mb-1">
                  Table {table.table_number}
                </Card.Title>
                <Card.Text className="text-muted mb-2">
                  Capacity: {table.capacity} persons
                </Card.Text>
                
                <Badge bg={getStatusColor(table.status)} className="mb-2">
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </Badge>

                {table.current_order && (
                  <div className="mt-2">
                    <small className="text-muted d-block">
                      Customer: {table.current_order.customer_name}
                    </small>
                    <small className="text-muted d-block">
                      Items: {table.current_order.items}
                    </small>
                    <small className="text-muted d-block">
                      Time: {getTimeElapsed(table.current_order.order_time)}m ago
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
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
                  <h6>Table Information</h6>
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
                    <h6>Current Order</h6>
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