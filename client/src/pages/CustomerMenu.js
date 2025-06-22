import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Form, Nav, Tab, Badge, Offcanvas } from 'react-bootstrap';
import { FaShoppingCart, FaUtensils, FaSearch, FaFilter, FaStar, FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { SocketContext } from '../contexts/SocketContext';
import MenuCategory from '../components/customer/MenuCategory';
import CartSummary from '../components/customer/CartSummary';
import OrderTracker from '../components/customer/OrderTracker';

const CustomerMenu = () => {
  const { tableId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const { socket, connected } = useContext(SocketContext);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerPage, setDrawerPage] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    // Join customer room for socket communication
    if (socket && connected) {
      socket.emit('join_room', 'customer');
    }
  }, [socket, connected]);

  useEffect(() => {
    if (tableId) {
      const savedOrderId = localStorage.getItem(`order_${tableId}`);
      if (savedOrderId) {
        setActiveOrderId(savedOrderId);
      }
      fetchOrderHistory();
    }
  }, [tableId]);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/menu/items');
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item, quantity = 1) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
    
    toast.success(`${item.name} added to cart!`);
  };

  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const submitOrder = async (orderData) => {
    if (!tableId) {
      toast.error('Invalid Table ID. Please scan a valid QR code.');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const orderPayload = {
        tableId: parseInt(tableId),
        customerName: customerName,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity
        })),
        total_amount: getTotalAmount(),
        special_instructions: orderData.specialInstructions || ''
      };

      const response = await axios.post('/api/orders', orderPayload);
      
      if (response.data.success) {
        toast.success('Order submitted successfully!');
        setCart([]);
        setCustomerName('');
        setShowOrderModal(false);
        setShowCart(false);
        setActiveOrderId(response.data.orderId);
        localStorage.setItem(`order_${tableId}`, response.data.orderId);
        fetchOrderHistory();
      } else {
        toast.error(response.data.msg || 'Failed to submit order');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'Failed to submit order';
      toast.error(errorMsg);
    }
  };

  const handleCheckout = (orderData) => {
    setShowOrderModal(true);
  };

  // Filter and group menu items by category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter out null/undefined categories before creating the set
  const validCategories = menuItems.map(item => item.category_name).filter(Boolean);
  const categories = ['all', ...new Set(validCategories)];

  const groupedItems = categories.reduce((acc, category) => {
    if (category === 'all') return acc;
    acc[category] = filteredItems.filter(item => item.category_name === category);
    return acc;
  }, {});

  // Fetch order history for the table
  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get(`/api/orders?table_id=${tableId}`);
      setOrderHistory(response.data);
    } catch (error) {
      setOrderHistory([]);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="px-0">
      {/* Mobile Drawer (Hamburger) */}
      <Offcanvas show={showDrawer} onHide={() => { setShowDrawer(false); setDrawerPage(null); }} placement="start" className="d-lg-none">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {drawerPage === null && (
            <Nav className="flex-column">
              <Nav.Link onClick={() => setDrawerPage('order')}>Order</Nav.Link>
              <Nav.Link onClick={() => setDrawerPage('about')}>About</Nav.Link>
              <Nav.Link onClick={() => setDrawerPage('contact')}>Contact</Nav.Link>
              <Nav.Link onClick={() => setDrawerPage('reviews')}>Reviews</Nav.Link>
              <Nav.Link onClick={() => setDrawerPage('policies')}>Policies</Nav.Link>
            </Nav>
          )}
          {drawerPage === 'order' && (
            <div>
              <Button variant="link" onClick={() => setDrawerPage(null)}>&larr; Back</Button>
              <h4>Order Status</h4>
              {activeOrderId ? (
                <OrderTracker 
                  orderId={activeOrderId} 
                  tableId={tableId} 
                  socket={socket} 
                  onOrderComplete={() => {
                    localStorage.removeItem(`order_${tableId}`);
                    setActiveOrderId(null);
                    fetchOrderHistory();
                  }}
                />
              ) : (
                <p>No active order. Place an order to track it here.</p>
              )}
              <hr />
              <h5>Order History</h5>
              {orderHistory.length > 0 ? (
                <ul className="list-unstyled">
                  {orderHistory.map(order => (
                    <li key={order.id} className="mb-2">
                      <strong>Order #{order.id}</strong> - {order.status} - ₱{parseFloat(order.total_amount).toFixed(2)}
                      <br />
                      <small>{new Date(order.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No previous orders for this table.</p>
              )}
            </div>
          )}
          {drawerPage === 'about' && (
            <div>
              <Button variant="link" onClick={() => setDrawerPage(null)}>&larr; Back</Button>
              <h4>About Us</h4>
              <p>Welcome to Harah Rubina Del Dios! We are dedicated to providing you with the best farm-to-table dining experience. Enjoy our fresh, locally sourced menu and warm hospitality.</p>
            </div>
          )}
          {drawerPage === 'contact' && (
            <div>
              <Button variant="link" onClick={() => setDrawerPage(null)}>&larr; Back</Button>
              <h4>Contact Us</h4>
              <p>Have questions or feedback? Reach out to us!</p>
              <ul className="list-unstyled">
                <li><strong>Phone:</strong> 0912-345-6789</li>
                <li><strong>Email:</strong> info@harahrubinadeldios.com</li>
                <li><strong>Address:</strong> 123 Farm Road, City, Country</li>
              </ul>
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>Your Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter your name" />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Your Message</Form.Label>
                  <Form.Control as="textarea" rows={3} placeholder="Type your message..." />
                </Form.Group>
                <Button variant="primary" type="submit">Send</Button>
              </Form>
            </div>
          )}
          {drawerPage === 'reviews' && (
            <div>
              <Button variant="link" onClick={() => setDrawerPage(null)}>&larr; Back</Button>
              <h4>Customer Reviews</h4>
              <p>"Amazing food and great service!" - Jane D.</p>
              <p>"Loved the farm-fresh ingredients." - Mark S.</p>
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>Leave a Review</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="Write your review..." />
                </Form.Group>
                <Button variant="primary" type="submit">Submit Review</Button>
              </Form>
            </div>
          )}
          {drawerPage === 'policies' && (
            <div>
              <Button variant="link" onClick={() => setDrawerPage(null)}>&larr; Back</Button>
              <h4>Policies</h4>
              <p><strong>Privacy Policy:</strong> We respect your privacy and do not share your information with third parties.</p>
              <p><strong>Refund Policy:</strong> Please contact us within 24 hours for any order issues or refund requests.</p>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Header */}
      <div className="bg-primary text-white py-3">
        <Container>
          <Row className="align-items-center">
            <Col className="d-flex align-items-center">
              {/* Hamburger menu for mobile */}
              <Button
                variant="light"
                className="me-2 d-lg-none"
                onClick={() => setShowDrawer(true)}
                aria-label="Open menu"
                style={{ fontSize: 24, padding: '0.25rem 0.75rem' }}
              >
                &#9776;
              </Button>
              <h1 className="mb-0">
                <FaUtensils className="me-1" />
                Harah Rubina Del Dios
              </h1>
            </Col>
            <Col xs="auto">
              {/* Header cart button: only visible on large screens and up */}
              <Button 
                variant="light" 
                onClick={() => setShowCart(true)}
                className="me-2 d-none d-lg-inline"
                style={{ minWidth: 100 }}
              >
                <FaShoppingCart className="me-2" />
                Cart ({cart.length})
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-2 px-1 px-md-3">
        <Row>
          {/* Menu Section */}
          <Col lg={showCart ? 8 : 12} xs={12} className="mb-3 mb-lg-0">
            {/* Search and Filter */}
            <Row className="mb-4">
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={6}>
                <div className="d-flex gap-2">
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
             
                </div>
              </Col>
            </Row>

            {/* Menu Categories */}
            {Object.keys(groupedItems).length > 0 ? (
              Object.entries(groupedItems).map(([category, items]) => (
                <MenuCategory
                  key={category}
                  category={category}
                  items={items}
                  onAddToCart={addToCart}
                />
              ))
            ) : (
              <Card>
                <Card.Body className="text-center text-muted">
                  <FaUtensils size={48} className="mb-3" />
                  <h5>No menu items found</h5>
                  <p>Try adjusting your search or filter criteria.</p>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Cart Sidebar */}
          {showCart && (
            <Col lg={4} className="d-none d-lg-block">
              <div className="sticky-top" style={{ top: '1rem' }}>
                <CartSummary
                  cart={cart}
                  onUpdateQuantity={updateCartQuantity}
                  onRemoveItem={removeFromCart}
                  onClearCart={clearCart}
                  onCheckout={handleCheckout}
                />
              </div>
            </Col>
          )}
        </Row>
      </Container>

      {/* Order Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Complete Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Your Name</Form.Label>
            <Form.Control
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </Form.Group>
          
          <div className="mb-3">
            <h6>Order Summary:</h6>
            <div className="border rounded p-3">
              {cart.map(item => (
                <div key={item.id} className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <strong>{item.name}</strong>
                    <br />
                    <small className="text-muted">Qty: {item.quantity}</small>
                  </div>
                  <span className="text-primary">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <hr />
              <div className="d-flex justify-content-between">
                <h5>Total:</h5>
                <h5 className="text-primary">₱{getTotalAmount().toFixed(2)}</h5>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => submitOrder({})}
            disabled={!customerName.trim()}
          >
            Submit Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Mobile Cart Drawer */}
      <Offcanvas 
        show={cartDrawerOpen} 
        onHide={() => setCartDrawerOpen(false)} 
        placement="top" 
        className="d-lg-none"
        style={{ borderBottomLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem', minHeight: '60vh', maxHeight: '90vh', overflow: 'hidden' }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Your Cart</Offcanvas.Title>
        </Offcanvas.Header>
        {/* Drag handle for mobile UX, outside scrollable area */}
        <div className="mx-auto my-2" style={{ width: 40, height: 5, background: '#ccc', borderRadius: 3 }} />
        <Offcanvas.Body className="d-flex justify-content-center align-items-start p-2" style={{ height: '100%', overflow: 'hidden', flexDirection: 'column' }}>
          <div
            style={{
              width: '100%',
              maxWidth: 400,
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              paddingBottom: 16
            }}
          >
            <CartSummary
              cart={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
              onCheckout={handleCheckout}
            />
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Floating cart button: only visible on small/medium screens */}
      {!cartDrawerOpen && cart.length > 0 && (
        <Button
          className="position-fixed bottom-0 end-0 m-3 rounded-circle shadow d-lg-none"
          style={{ zIndex: 1050, width: 56, height: 56 }}
          variant="primary"
          onClick={() => setCartDrawerOpen(true)}
          aria-label="Open cart"
        >
          <FaShoppingCart size={24} />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {cart.length}
          </span>
        </Button>
      )}

      {/* Order Tracker for customer */}
      {activeOrderId && (
        <Container className="my-4">
          <OrderTracker orderId={activeOrderId} tableId={tableId} socket={socket} />
        </Container>
      )}
    </Container>
  );
};

export default CustomerMenu; 