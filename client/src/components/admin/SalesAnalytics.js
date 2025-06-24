import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const SalesAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/sales/analytics');
        setAnalytics(res.data);
      } catch (err) {
        setError('Failed to fetch sales analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="my-4">{error}</Alert>;
  if (!analytics) return null;

  return (
    <div>
      <h2 className="mb-4">Sales Analytics</h2>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <h5>Total Sales</h5>
              <h3>{analytics.total_sales}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <h5>Total Revenue</h5>
              <h3>₱{parseFloat(analytics.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mb-4">
        <Card.Body>
          <h5>Sales by Day (Last 30 Days)</h5>
          {/* Chart placeholder */}
          <div className="mb-3 text-muted">[Chart coming soon]</div>
          <Table size="sm" bordered responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sales Count</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.sales_by_day.map(day => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>{day.sales_count}</td>
                  <td>₱{parseFloat(day.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <h5>Top 5 Products</h5>
              <Table size="sm" bordered responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Total Sold</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.top_products.map(prod => (
                    <tr key={prod.name}>
                      <td>{prod.name}</td>
                      <td>{prod.total_sold}</td>
                      <td>₱{parseFloat(prod.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <h5>Sales by Category</h5>
              <Table size="sm" bordered responsive>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Sold</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.sales_by_category.map(cat => (
                    <tr key={cat.category || 'Uncategorized'}>
                      <td>{cat.category || 'Uncategorized'}</td>
                      <td>{cat.total_sold}</td>
                      <td>₱{parseFloat(cat.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SalesAnalytics; 