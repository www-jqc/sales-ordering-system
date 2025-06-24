import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    table_id: '',
    date_from: '',
    date_to: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [statusStats, setStatusStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchOrderStatusStats();
    // eslint-disable-next-line
  }, [filters]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders', { params: filters });
      setOrders(res.data);
    } catch (error) {
      setOrders([]);
    }
  };

  const fetchOrderStatusStats = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await axios.get('/api/admin/dashboard-stats');
      setStatusStats(res.data);
    } catch (err) {
      setStatsError('Failed to load order status stats.');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleShowDetails = async (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    try {
      const res = await axios.get(`/api/orders/${order.id}/items`);
      setOrderItems(res.data);
    } catch {
      setOrderItems([]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleExport = () => {
    let csv = 'Order ID,Table,Customer,Status,Payment Status,Total,Created At\n';
    orders.forEach(o => {
      csv += `${o.id},${o.table_id},${o.customer_name},${o.status},${o.payment_status},${o.total_amount},${o.created_at}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Management</h2>
        <Button variant="outline-primary" onClick={handleExport}>
          <i className="fa fa-download me-2" /> Export
        </Button>
      </div>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Order Status Distribution</Card.Title>
          {loadingStats ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 150 }}>
              <Spinner animation="border" />
            </div>
          ) : statsError ? (
            <Alert variant="danger">{statsError}</Alert>
          ) : statusStats ? (
            <Pie
              data={{
                labels: ['Pending', 'Completed'],
                datasets: [
                  {
                    label: 'Orders',
                    data: [statusStats.pendingOrders, statusStats.completedOrders],
                    backgroundColor: [
                      'rgba(255, 205, 86, 0.7)',
                      'rgba(75, 192, 192, 0.7)'
                    ],
                    borderColor: [
                      'rgba(255, 205, 86, 1)',
                      'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          ) : null}
        </Card.Body>
      </Card>
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                  <option value="">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Payment Status</Form.Label>
                <Form.Select value={filters.payment_status} onChange={e => setFilters(f => ({ ...f, payment_status: e.target.value }))}>
                  <option value="">All</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Table</Form.Label>
                <Form.Control type="number" value={filters.table_id} onChange={e => setFilters(f => ({ ...f, table_id: e.target.value }))} placeholder="Table #" />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Date From</Form.Label>
                <Form.Control type="date" value={filters.date_from} onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Date To</Form.Label>
                <Form.Control type="date" value={filters.date_to} onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))} />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.table_id}</td>
                  <td>{order.customer_name || 'Walk-in'}</td>
                  <td><Badge bg="info">{order.status}</Badge></td>
                  <td><Badge bg={order.payment_status === 'paid' ? 'success' : 'warning'}>{order.payment_status}</Badge></td>
                  <td>₱{parseFloat(order.total_amount).toFixed(2)}</td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => handleShowDetails(order)}>
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <h5>Order #{selectedOrder.id}</h5>
              <p>
                <strong>Table:</strong> {selectedOrder.table_id}<br />
                <strong>Customer:</strong> {selectedOrder.customer_name || 'Walk-in'}<br />
                <strong>Status:</strong> {selectedOrder.status}<br />
                <strong>Payment Status:</strong> {selectedOrder.payment_status}<br />
                <strong>Total:</strong> ₱{parseFloat(selectedOrder.total_amount).toFixed(2)}<br />
                <strong>Created:</strong> {new Date(selectedOrder.created_at).toLocaleString()}<br />
                <strong>Completed:</strong> {selectedOrder.completed_at ? new Date(selectedOrder.completed_at).toLocaleString() : 'N/A'}<br />
                <strong>Delivered:</strong> {selectedOrder.delivered_at ? new Date(selectedOrder.delivered_at).toLocaleString() : 'N/A'}<br />
                <strong>Special Instructions:</strong> {selectedOrder.special_instructions || 'None'}<br />
                <strong>Notes:</strong> {selectedOrder.notes || 'None'}
              </p>
              <h6 className="mt-4">Order Items</h6>
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted">No items</td></tr>
                  ) : orderItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>₱{parseFloat(item.unit_price).toFixed(2)}</td>
                      <td>₱{parseFloat(item.subtotal).toFixed(2)}</td>
                      <td>{item.notes || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OrderManagement;