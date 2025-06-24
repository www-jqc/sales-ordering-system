import React, { useState, useEffect } from 'react';
import { Table, Form, Alert, Card, InputGroup, FormControl } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSearch } from 'react-icons/fa';

const MenuAvailability = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/menu');
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleAvailabilityChange = async (item, isAvailable) => {
    try {
      // Optimistic UI update
      setMenuItems(prevItems =>
        prevItems.map(prevItem =>
          prevItem.id === item.id ? { ...prevItem, is_available: isAvailable } : prevItem
        )
      );

      await axios.put(`/api/menu/${item.id}/availability`, { is_available: isAvailable });
      toast.success(`${item.name} availability updated!`);
    } catch (error) {
      toast.error(`Failed to update ${item.name}.`);
      // Revert UI on failure
      setMenuItems(prevItems =>
        prevItems.map(prevItem =>
          prevItem.id === item.id ? { ...prevItem, is_available: !isAvailable } : prevItem
        )
      );
    }
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading menu...</div>;

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Menu Item Availability</h5>
          <InputGroup style={{ maxWidth: '300px' }}>
            <FormControl
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroup.Text><FaSearch /></InputGroup.Text>
          </InputGroup>
        </div>
      </Card.Header>
      <Card.Body>
        {filteredItems.length > 0 ? (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th className="text-center">Available</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category_name}</td>
                  <td className="text-center">
                    <Form.Check
                      type="switch"
                      id={`item-switch-${item.id}`}
                      checked={Boolean(item.is_available)}
                      onChange={(e) => handleAvailabilityChange(item, e.target.checked)}
                      aria-label={`Toggle availability for ${item.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Alert variant="info">No menu items found.</Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default MenuAvailability;