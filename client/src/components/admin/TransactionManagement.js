import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    paymentMethod: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/sales', { params: filters });
      setTransactions(res.data);
    } catch (error) {
      setTransactions([]);
    }
  };

  const handleShowDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };

  const handleExport = () => {
    let csv = 'Transaction ID,Order ID,Customer,Payment Method,Amount,Received,Change,Cashier,Status,Date\n';
    transactions.forEach(t => {
      csv += `${t.id},${t.order_id},${t.customer_name},${t.payment_method},${t.amount_paid},${t.amount_paid},${t.change_amount},${t.cashier_name},${t.status || ''},${t.transaction_date}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Transaction Management</h2>
        <Button variant="outline-primary" onClick={handleExport}>
          <i className="fa fa-download me-2" /> Export
        </Button>
      </div>
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Payment Method</Form.Label>
                <Form.Select value={filters.paymentMethod} onChange={e => setFilters(f => ({ ...f, paymentMethod: e.target.value }))}>
                  <option value="">All Methods</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="DIGITAL_WALLET">Digital Wallet</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                  <option value="">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </Form.Select>
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
                <th>Transaction ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Received</th>
                <th>Change</th>
                <th>Cashier</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={11} className="text-center text-muted">No transactions found</td></tr>
              ) : transactions.map(t => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td>#{t.order_id}</td>
                  <td>{t.customer_name || 'Walk-in'}</td>
                  <td>{t.payment_method}</td>
                  <td>₱{parseFloat(t.amount_paid).toFixed(2)}</td>
                  <td>₱{parseFloat(t.amount_paid).toFixed(2)}</td>
                  <td>₱{parseFloat(t.change_amount || 0).toFixed(2)}</td>
                  <td>{t.cashier_name || 'System'}</td>
                  <td><Badge bg={t.status === 'COMPLETED' ? 'success' : t.status === 'FAILED' ? 'danger' : 'warning'}>{t.status || 'N/A'}</Badge></td>
                  <td>{new Date(t.transaction_date).toLocaleString()}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => handleShowDetails(t)}>
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      {/* Transaction Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <>
              <h5>Transaction #{selectedTransaction.id}</h5>
              <p>
                <strong>Order ID:</strong> {selectedTransaction.order_id}<br />
                <strong>Customer:</strong> {selectedTransaction.customer_name || 'Walk-in'}<br />
                <strong>Payment Method:</strong> {selectedTransaction.payment_method}<br />
                <strong>Amount:</strong> ₱{parseFloat(selectedTransaction.amount_paid).toFixed(2)}<br />
                <strong>Received:</strong> ₱{parseFloat(selectedTransaction.amount_paid).toFixed(2)}<br />
                <strong>Change:</strong> ₱{parseFloat(selectedTransaction.change_amount || 0).toFixed(2)}<br />
                <strong>Cashier:</strong> {selectedTransaction.cashier_name || 'System'}<br />
                <strong>Status:</strong> {selectedTransaction.status || 'N/A'}<br />
                <strong>Date:</strong> {new Date(selectedTransaction.transaction_date).toLocaleString()}<br />
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TransactionManagement; 