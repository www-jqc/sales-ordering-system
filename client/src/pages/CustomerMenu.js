import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Form, Nav, Tab, Badge, Offcanvas } from 'react-bootstrap';
import { FaShoppingCart, FaUtensils, FaSearch, FaFilter, FaStar, FaHeart, FaThumbsUp, FaBell } from 'react-icons/fa';
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [displayedCategories, setDisplayedCategories] = useState([]);
  const [showNotificationBell, setShowNotificationBell] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    // Join customer room for socket communication
    if (socket && connected) {
      socket.emit('join_room', 'customer');
      socket.emit('join_room', `table_${tableId}`);
    }
  }, [socket, connected, tableId]);

  useEffect(() => {
    if (tableId) {
      const savedOrderId = localStorage.getItem(`order_${tableId}`);
      if (savedOrderId) {
        setActiveOrderId(savedOrderId);
      }
      fetchOrderHistory();
    }
  }, [tableId]);

  useEffect(() => {
    if (socket) {
      const handleMenuItemUpdate = (data) => {
        const { productId, is_available } = data;
        
        // Play notification sound
        try {
          const audio = new Audio('/notifications.mp3');
          audio.volume = 0.5; // Set volume to 50%
          audio.play().catch(err => {
            console.log('Could not play notification sound:', err);
          });
        } catch (error) {
          console.log('Error creating audio element:', error);
        }
        
        // Show notification bell
        setShowNotificationBell(true);
        
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.id === productId ? { ...item, is_available } : item
          )
        );
        
        // Show toast with different messages based on availability
        const status = is_available ? 'available' : 'unavailable';
        toast.info(`A menu item is now ${status}!`, { 
          autoClose: 3000,
          icon: is_available ? '✅' : '❌'
        });
        
        // Hide notification bell after 5 seconds
        setTimeout(() => {
          setShowNotificationBell(false);
        }, 5000);
      };

      socket.on('menu_item_updated', handleMenuItemUpdate);

      return () => {
        socket.off('menu_item_updated', handleMenuItemUpdate);
      };
    }
  }, [socket]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/menu');
      // The API now returns an object with an 'items' property
      if (res.data && Array.isArray(res.data.items)) {
        setMenuItems(res.data.items);
        // Extract unique categories from the items
        const uniqueCategories = [...new Set(res.data.items.map(item => item.category_name).filter(Boolean))];
        setDisplayedCategories(uniqueCategories);
      } else {
        // Handle cases where the response is not as expected
        setMenuItems([]);
        setDisplayedCategories([]);
        toast.error('Could not load menu items. Invalid format received.');
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      toast.error('Could not load the menu. Please try again later.');
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
      setCart([...cart, { 
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image_url: item.image_url,
        quantity 
      }]);
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
        table_id: parseInt(tableId),
        customer_name: customerName,
        items: cart.map(item => ({
          menu_item_id: item.id, // Corrected: was product_id
          quantity: item.quantity,
          price: item.price, // Sending price for backend calculation
          notes: item.notes || null
        })),
        // The backend should calculate the final total amount for security
        special_instructions: orderData.specialInstructions || '' // Corrected: was special_requests
      };

      const response = await axios.post('/api/orders', orderPayload);
      
      if (response.data.success) {
        toast.success('Order submitted successfully!');
        setCart([]);
        setCustomerName('');
        setShowOrderModal(false);
        setShowCart(false);
        setActiveOrderId(response.data.order_id);
        localStorage.setItem(`order_${tableId}`, response.data.order_id);
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

  const submitFeedback = async () => {
    if (!activeOrderId) {
      toast.error('No active order to provide feedback for');
      return;
    }

    try {
      const response = await axios.post(`/api/orders/${activeOrderId}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment,
      });

      if (response.data.success) {
        toast.success('Thank you for your feedback!');
        setShowFeedbackModal(false);
        setFeedbackRating(5);
        setFeedbackComment('');
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
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
  const categoryFilters = ['all', ...new Set(validCategories)];

  const groupedItems = categoryFilters.reduce((acc, category) => {
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
      console.error("Failed to fetch order history:", error);
      toast.error('Could not load order details.');
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
                <OrderTracker orderId={activeOrderId} socket={socket} onOrderComplete={() => setActiveOrderId(null)} />
              ) : (
                <div className="text-center p-3">
                  <p>You have no active orders.</p>
                </div>
              )}
              
              {/* Mobile Assistance Request */}
              <div className="mt-4">
                <Button 
                  variant="outline-primary" 
                  className="w-100"
                  onClick={() => {
                    if (socket) {
                      socket.emit('customer_request', {
                        tableId: tableId,
                        message: `Assistance requested at Table ${tableId}.`
                      });
                      toast.success('Staff has been notified for assistance!');
                    } else {
                      toast.error('Connection lost. Please refresh the page.');
                    }
                  }}
                >
                  <FaBell className="me-2" />
                  Request Assistance
                </Button>
              </div>
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
              
              {/* Notification Bell */}
              {showNotificationBell && (
                <div className="d-inline-block me-2">
                  <div className="position-relative">
                    <div className="text-warning fs-4 animate-pulse">
                      🔔
                    </div>
                    <div className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger animate-bounce">
                      !
                    </div>
                  </div>
                </div>
              )}
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
                    {categoryFilters.map(category => (
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

          {/* Order Tracker for customer */}
          <Col lg={3} className="border-start d-none d-lg-block p-3">
            <h4 className="mb-4">Track Your Order</h4>
            {activeOrderId ? (
              <OrderTracker orderId={activeOrderId} socket={socket} onOrderComplete={() => {
                setActiveOrderId(null);
                localStorage.removeItem(`order_${tableId}`);
                fetchOrderHistory(); // Refresh history to show the completed order
              }} />
            ) : (
              <div className="text-center text-muted p-4 border rounded">
                <p className="mb-0">No active order to track.</p>
                <small>Once you place an order, its status will appear here.</small>
              </div>
            )}
            
            {/* Customer Assistance Request */}
            <div className="mt-4">
              <Button 
                variant="outline-primary" 
                className="w-100"
                onClick={() => {
                  if (socket) {
                    socket.emit('customer_request', {
                      tableId: tableId,
                      message: `Assistance requested at Table ${tableId}.`
                    });
                    toast.success('Staff has been notified for assistance!');
                  } else {
                    toast.error('Connection lost. Please refresh the page.');
                  }
                }}
              >
                <FaBell className="me-2" />
                Request Assistance
              </Button>
            </div>
          </Col>
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

      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rate Your Experience</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Rating</Form.Label>
            <div className="d-flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Button
                  key={star}
                  variant={star <= feedbackRating ? "warning" : "outline-warning"}
                  onClick={() => setFeedbackRating(star)}
                  style={{ minWidth: 44, minHeight: 44 }}
                >
                  <FaStar />
                </Button>
              ))}
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Comment (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Tell us about your experience..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitFeedback}>
            Submit Feedback
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

      {/* Floating assistance button: only visible on small/medium screens */}
      <Button
        className="position-fixed bottom-0 start-0 m-3 rounded-circle shadow d-lg-none"
        style={{ zIndex: 1050, width: 56, height: 56 }}
        variant="warning"
        onClick={() => {
          if (socket) {
            socket.emit('customer_request', {
              tableId: tableId,
              message: `Assistance requested at Table ${tableId}.`
            });
            toast.success('Staff has been notified for assistance!');
          } else {
            toast.error('Connection lost. Please refresh the page.');
          }
        }}
        aria-label="Request assistance"
      >
        <FaBell size={24} />
      </Button>
    </Container>
  );
};

export default CustomerMenu; 