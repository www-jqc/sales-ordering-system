import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Table, Form, Button } from 'react-bootstrap';

const Reports = () => {
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchReports();
  }, [dateFrom, dateTo]);

  const fetchReports = async () => {
    const ordersRes = await axios.get('/api/orders', { params: { dateFrom, dateTo } });
    setOrders(ordersRes.data);
    const txRes = await axios.get('/api/transactions', { params: { dateFrom, dateTo } });
    setTransactions(txRes.data);
  };

  const exportCSV = () => {
    // Simple CSV export for orders
    let csv = 'Order ID,Table,Customer,Status,Total\n';
    orders.forEach(o => {
      csv += `${o.id},${o.table_id},${o.customer_name},${o.status},${o.total_amount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <Card.Header>
        <h4>Reports</h4>
      </Card.Header>
      <Card.Body>
        <Form className="mb-3 d-flex gap-2">
          <Form.Group>
            <Form.Label>Date From</Form.Label>
            <Form.Control type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Date To</Form.Label>
            <Form.Control type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </Form.Group>
          <Button className="align-self-end" onClick={exportCSV}>Export CSV</Button>
        </Form>
        <Table bordered>
          <thead>
            <tr><th>Order ID</th><th>Table</th><th>Customer</th><th>Status</th><th>Total</th></tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.table_id}</td>
                <td>{o.customer_name}</td>
                <td>{o.status}</td>
                <td>₱{parseFloat(o.total_amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {/* Placeholder for charts */}
        <div className="mt-4">[Charts go here]</div>
      </Card.Body>
    </Card>
  );
};

export default Reports; 