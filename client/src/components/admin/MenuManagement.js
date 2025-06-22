import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Badge } from 'react-bootstrap';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true,
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    const res = await axios.get('/api/menu/items');
    setMenuItems(res.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get('/api/menu/categories');
    setCategories(res.data);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.category_id,
      is_available: item.is_available,
      image_url: item.image_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this menu item?')) {
      await axios.delete(`/api/menu/items/${id}`);
      fetchMenuItems();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload = { ...formData };
    if (imageFile) {
      // handle image upload (pseudo, replace with your upload logic)
      // const imgRes = await uploadImage(imageFile);
      // payload.image_url = imgRes.url;
    }
    if (editingItem) {
      await axios.put(`/api/menu/items/${editingItem.id}`, payload);
    } else {
      await axios.post('/api/menu/items', payload);
    }
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: '', description: '', price: '', category_id: '', is_available: true, image_url: '' });
    setImageFile(null);
    fetchMenuItems();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Menu Management</h2>
        <Button onClick={() => { setShowModal(true); setEditingItem(null); }}>Add Menu Item</Button>
      </div>
      <Table bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Available</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{categories.find(c => c.id === item.category_id)?.name || '-'}</td>
              <td>₱{parseFloat(item.price).toFixed(2)}</td>
              <td>{item.is_available ? <Badge bg="success">Yes</Badge> : <Badge bg="danger">No</Badge>}</td>
              <td>{item.image_url && <img src={item.image_url} alt={item.name} width={40} />}</td>
              <td>
                <Button size="sm" variant="primary" onClick={() => handleEdit(item)}>Edit</Button>{' '}
                <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} required>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Available" checked={formData.is_available} onChange={e => setFormData({ ...formData, is_available: e.target.checked })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" onChange={e => setImageFile(e.target.files[0])} />
              {formData.image_url && <img src={formData.image_url} alt="preview" width={60} className="mt-2" />}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingItem ? 'Update' : 'Add'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement; 