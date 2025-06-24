import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row>
        <Col>
          <Card className="text-center shadow-lg p-5 border-0 rounded-3">
            <Card.Body>
              <FaExclamationTriangle size={60} className="text-danger mb-4" />
              <Card.Title as="h1" className="mb-3">Access Denied</Card.Title>
              <Card.Text className="text-muted mb-4">
                You do not have the necessary permissions to view this page.
              </Card.Text>
              <Button variant="primary" onClick={() => navigate(-1)} size="lg">
                Go Back
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Unauthorized; 