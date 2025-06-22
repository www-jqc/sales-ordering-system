import React, { useState } from 'react';
import { Card, Row, Col, Badge, Button, Modal } from 'react-bootstrap';
import { FaUtensils, FaStar, FaHeart, FaShoppingCart } from 'react-icons/fa';

const MenuCategory = ({ category, items, onAddToCart }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleAddToCart = (item, quantity = 1) => {
    onAddToCart(item, quantity);
    setShowModal(false);
  };

  const handleFavorite = (itemId, e) => {
    e.stopPropagation();
    setFavoriteIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const getCategoryIcon = (categoryName) => {
    switch (categoryName.toLowerCase()) {
      case 'appetizer': return '🥗';
      case 'main': return '🍽️';
      case 'dessert': return '🍰';
      case 'beverage': return '🥤';
      default: return '🍴';
    }
  };

  const getCategoryColor = (categoryName) => {
    switch (categoryName.toLowerCase()) {
      case 'appetizer': return 'success';
      case 'main': return 'primary';
      case 'dessert': return 'warning';
      case 'beverage': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <>
      <div className="mb-4">
        <div className="d-flex align-items-center mb-3">
          <span className="h3 me-2">{getCategoryIcon(category)}</span>
          <h4 className="mb-0">{category}</h4>
          <Badge bg={getCategoryColor(category)} className="ms-2">
            {items.length} items
          </Badge>
        </div>
        <Row>
          {items.map(item => (
            <Col key={item.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
              <Card
                className="h-100 menu-item-card shadow-sm rounded cursor-pointer fade-in"
                onClick={() => handleItemClick(item)}
                style={{ transition: 'box-shadow 0.2s', minHeight: 340 }}
              >
                {item.image_url ? (
                  <Card.Img
                    variant="top"
                    src={item.image_url}
                    alt={item.name}
                    className="img-fluid"
                    style={{ height: '180px', objectFit: 'cover', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}
                  />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: 180 }}>
                    <FaUtensils size={32} className="text-muted" />
                  </div>
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h6 mb-0 text-truncate-2" title={item.name}>{item.name}</Card.Title>
                    <Button
                      variant={favoriteIds.includes(item.id) ? 'danger' : 'outline-danger'}
                      size="sm"
                      onClick={(e) => handleFavorite(item.id, e)}
                      aria-label={`Add ${item.name} to favorites`}
                      style={{ minWidth: 36, minHeight: 36, borderRadius: '50%' }}
                      tabIndex={0}
                    >
                      <FaHeart />
                    </Button>
                  </div>
                  <Card.Text className="text-muted small flex-grow-1 text-truncate-2" title={item.description}>
                    {item.description}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-primary">₱{parseFloat(item.price).toFixed(2)}</span>
                      <div className="d-flex align-items-center">
                        <FaStar className="text-warning me-1" />
                        <small className="text-muted">4.5</small>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item, 1);
                        }}
                        disabled={!item.is_available}
                        aria-label={`Add ${item.name} to cart`}
                        style={{ minWidth: 44, minHeight: 44, fontWeight: 600 }}
                        tabIndex={0}
                      >
                        <FaShoppingCart className="me-1" />
                        {item.is_available ? 'Add' : 'Unavailable'}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      {/* Item Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedItem?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <Row>
              <Col md={6}>
                {selectedItem.image_url ? (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    className="img-fluid rounded w-100 mb-3"
                  />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center rounded mb-3" style={{ height: 220 }}>
                    <FaUtensils size={48} className="text-muted" />
                  </div>
                )}
              </Col>
              <Col md={6}>
                <h5>{selectedItem.name}</h5>
                <p className="text-muted">{selectedItem.description}</p>
                <div className="mb-3">
                  <span className="h4 text-primary">₱{parseFloat(selectedItem.price).toFixed(2)}</span>
                </div>
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaStar className="text-warning me-1" />
                    <span className="me-2">4.5</span>
                    <small className="text-muted">(24 reviews)</small>
                  </div>
                </div>
                <div className="mb-3">
                  <h6>Ingredients:</h6>
                  <p className="text-muted small">
                    {selectedItem.ingredients || 'Fresh ingredients prepared daily'}
                  </p>
                </div>
                <div className="mb-3">
                  <h6>Allergens:</h6>
                  <div className="d-flex flex-wrap gap-1">
                    {selectedItem.allergens?.map((allergen, index) => (
                      <Badge key={index} bg="warning" text="dark">
                        {allergen}
                      </Badge>
                    )) || (
                      <span className="text-muted">No allergens listed</span>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-grow-1 py-2 mt-2"
                    onClick={() => handleAddToCart(selectedItem, 1)}
                    disabled={!selectedItem.is_available}
                    aria-label={`Add ${selectedItem?.name} to cart`}
                    style={{ minWidth: 44, minHeight: 44 }}
                  >
                    <FaShoppingCart className="me-2" />
                    {selectedItem?.is_available ? 'Add to Cart' : 'Currently Unavailable'}
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MenuCategory; 