import React, { useState, useTransition } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaCreditCard, FaMoneyBill, FaQrcode, FaCalculator } from 'react-icons/fa';

const PaymentModal = ({ show, onHide, order, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);
  const [isPending, startTransition] = useTransition();

  const calculateChange = (received) => {
    const receivedAmount = parseFloat(received) || 0;
    const totalAmount = parseFloat(order?.total_amount) || 0;
    return Math.max(0, receivedAmount - totalAmount);
  };

  const handleAmountChange = (e) => {
    const amount = e.target.value;
    setAmountReceived(amount);
    setChange(calculateChange(amount));
  };

  const handlePayment = () => {
    startTransition(async () => {
      try {
        const isSuccess = await onPaymentComplete({
          orderId: order.id,
          paymentMethod,
          amountReceived: parseFloat(amountReceived),
          change: change
        });
        
        if (isSuccess) {
          onHide();
        }
      } catch (error) {
        // Parent component will toast the error
        console.error("Payment submission failed in modal:", error);
      }
    });
  };

  const isPaymentValid = () => {
    const received = parseFloat(amountReceived) || 0;
    const total = parseFloat(order?.total_amount) || 0;
    return received >= total && received > 0;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Process Payment - Order #{order?.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <h6>Order Summary</h6>
            <div className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Customer:</span>
                <strong>{order?.customer_name || 'Guest'}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Table:</span>
                <strong>{order?.table_number}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Items:</span>
                <strong>{order?.order_items?.length || 0}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="h5">Total:</span>
                <span className="h5 text-primary">₱{parseFloat(order?.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </Col>
          
          <Col md={6}>
            <h6>Payment Details</h6>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    name="paymentMethod"
                    label={<><FaMoneyBill className="me-1" />Cash</>}
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    name="paymentMethod"
                    label={<><FaCreditCard className="me-1" />Card</>}
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    name="paymentMethod"
                    label={<><FaQrcode className="me-1" />GCash</>}
                    checked={paymentMethod === 'gcash'}
                    onChange={() => setPaymentMethod('gcash')}
                  />
                </div>
              </Form.Group>

              {paymentMethod === 'cash' && (
                <Form.Group className="mb-3">
                  <Form.Label>Amount Received</Form.Label>
                  <Form.Control
                    type="number"
                    value={amountReceived}
                    onChange={handleAmountChange}
                    placeholder="Enter amount received"
                    step="0.01"
                  />
                  {change > 0 && (
                    <div className="mt-2">
                      <strong>Change: ₱{change.toFixed(2)}</strong>
                    </div>
                  )}
                </Form.Group>
              )}

              {!isPaymentValid() && paymentMethod === 'cash' && (
                <Alert variant="warning">
                  Amount received must be equal to or greater than the total.
                </Alert>
              )}
            </Form>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="success" 
          onClick={handlePayment}
          disabled={!isPaymentValid() || isPending}
        >
          {isPending ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Processing...
            </>
          ) : (
            <>
              <FaCalculator className="me-2" />
              Complete Payment
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal; 