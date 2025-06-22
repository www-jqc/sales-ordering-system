import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Badge, Button } from 'react-bootstrap';
import { FaSearch, FaDownload, FaEye, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    paymentMethod: '',
    status: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter(t => t.paymentMethod === filters.paymentMethod);
    }

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      paymentMethod: '',
      status: ''
    });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return '💵';
      case 'card': return '💳';
      case 'gcash': return '📱';
      default: return '💰';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge bg="success">Completed</Badge>;
      case 'pending': return <Badge bg="warning">Pending</Badge>;
      case 'cancelled': return <Badge bg="danger">Cancelled</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const exportTransactions = () => {
    // Implement CSV export functionality
    console.log('Exporting transactions...');
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
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Transaction History</h5>
          <div>
            <Button variant="outline-primary" size="sm" className="me-2" onClick={exportTransactions}>
              <FaDownload className="me-1" />
              Export
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {/* Filters */}
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Date From</Form.Label>
              <Form.Control
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Date To</Form.Label>
              <Form.Control
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              >
                <option value="">All</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="gcash">GCash</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
              <FaFilter className="me-1" />
              Clear
            </Button>
          </Col>
        </Row>

        {/* Transactions Table */}
        <Table responsive striped>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Order #</th>
              <th>Customer</th>
              <th>Table</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>#{transaction.id}</td>
                  <td>#{transaction.order_id}</td>
                  <td>{transaction.customer_name}</td>
                  <td>Table {transaction.table_id}</td>
                  <td>₱{parseFloat(transaction.total_amount).toFixed(2)}</td>
                  <td>
                    <span className="me-2">{getPaymentMethodIcon(transaction.payment_method)}</span>
                    {transaction.payment_method.toUpperCase()}
                  </td>
                  <td>{new Date(transaction.created_at).toLocaleString()}</td>
                  <td>
                    <Button variant="outline-primary" size="sm">
                      <FaEye />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <div className="mt-3 p-3 bg-light rounded">
            <Row>
              <Col md={3}>
                <strong>Total Transactions:</strong> {filteredTransactions.length}
              </Col>
              <Col md={3}>
                <strong>Total Amount:</strong> ₱{filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
              </Col>
              <Col md={3}>
                <strong>Average Amount:</strong> ₱{(filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length).toFixed(2)}
              </Col>
              <Col md={3}>
                <strong>Completed:</strong> {filteredTransactions.filter(t => t.status === 'completed').length}
              </Col>
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TransactionHistory; 