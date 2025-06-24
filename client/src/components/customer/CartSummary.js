import React, { useState } from 'react';
import { Card, ListGroup, Button, Form, Badge, Modal } from 'react-bootstrap';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaCalculator } from 'react-icons/fa';

const CartSummary = ({ cart, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout }) => {
  const [showModal, setShowModal] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowModal(true);
  };

  const confirmCheckout = () => {
    onCheckout({
      items: cart,
      totalAmount: getTotalAmount(),
      specialInstructions: specialInstructions.trim()
    });
    setShowModal(false);
    setSpecialInstructions('');
  };

  if (cart.length === 0) {
    return (
      <Card className="h-100 shadow rounded">
        <Card.Body className="text-center d-flex flex-column justify-content-center">
          <FaShoppingCart size={48} className="text-muted mb-3" />
          <h5 className="text-muted">Your cart is empty</h5>
          <p className="text-muted">Add some delicious items to get started!</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-100 shadow rounded p-2 p-md-3">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center rounded-top">
          <span>
              <FaShoppingCart className="me-2" />
              Your Cart ({getTotalItems()})
          </span>
            <Button 
              variant="outline-light" 
              size="sm"
              onClick={onClearCart}
              aria-label="Clear cart"
            style={{ minWidth: 36, minHeight: 36, borderRadius: '50%' }}
            >
              <FaTrash />
            </Button>
        </Card.Header>
        <Card.Body className="p-0 bg-light">
          <ListGroup variant="flush">
            {cart.map(item => (
              <ListGroup.Item key={item.id} className="border-0 py-3 px-2">
                <div className="d-flex align-items-center gap-3">
                  <div>
                    <img
                      src={item.image_url || 'https://via.placeholder.com/64'}
                      alt={item.name}
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="mb-0 text-truncate" title={item.name}>{item.name}</h6>
                      <span className="text-primary fw-bold">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    {item.notes && (
                      <small className="text-muted d-block mb-2">
                        Note: {item.notes}
                      </small>
                    )}
                    <div className="d-flex align-items-center justify-content-between mt-2">
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          style={{ minWidth: 32, minHeight: 32, borderRadius: '50%' }}
                        >
                          <FaMinus />
                        </Button>
                        <span className="px-3 py-1 border bg-white rounded">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          style={{ minWidth: 32, minHeight: 32, borderRadius: '50%' }}
                        >
                          <FaPlus />
                        </Button>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
        <Card.Footer className="bg-white rounded-bottom">
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Subtotal:</span>
              <span>₱{getTotalAmount().toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Service Charge (10%):</span>
              <span>₱{(getTotalAmount() * 0.1).toFixed(2)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <strong>Total:</strong>
              <strong className="text-primary h5 mb-0">
                ₱{(getTotalAmount() * 1.1).toFixed(2)}
              </strong>
            </div>
          </div>
          <Button
            variant="success"
            size="lg"
            className="w-100 py-3 mt-2 fw-bold shadow-sm"
            onClick={handleCheckout}
            aria-label="Proceed to checkout"
            style={{ minWidth: 44, minHeight: 44, fontSize: '1.1rem' }}
          >
            <FaCalculator className="me-2" />
            Proceed to Checkout
          </Button>
        </Card.Footer>
      </Card>

      {/* Checkout Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" dialogClassName="modal-fullscreen-sm-down">
        <Modal.Header closeButton>
          <Modal.Title>Order Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6>Order Items:</h6>
            <ListGroup>
              {cart.map(item => (
                <ListGroup.Item key={item.id} className="d-flex justify-content-between">
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
                  <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
          <div className="mb-4">
            <h6>Special Instructions:</h6>
            <Form.Control
              as="textarea"
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests or instructions for your order..."
            />
          </div>
          <div className="border rounded p-3">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>₱{getTotalAmount().toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Service Charge (10%):</span>
              <span>₱{(getTotalAmount() * 0.1).toFixed(2)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between">
              <strong>Total Amount:</strong>
              <strong className="text-primary h5 mb-0">
                ₱{(getTotalAmount() * 1.1).toFixed(2)}
              </strong>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Back to Cart
          </Button>
          <Button variant="success" onClick={confirmCheckout}>
            Confirm Order
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CartSummary; 