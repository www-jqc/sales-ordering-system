import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Badge } from 'react-bootstrap';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const res = await axios.get('/api/categories');
    setCategories(res.data);
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description, is_active: cat.is_active });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingCategory) {
      await axios.put(`/api/categories/${editingCategory.id}`, formData);
    } else {
      await axios.post('/api/categories', formData);
    }
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', is_active: true });
    fetchCategories();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Category Management</h2>
        <Button onClick={() => { setShowModal(true); setEditingCategory(null); }}>Add Category</Button>
      </div>
      <Table bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.description}</td>
              <td>{cat.is_active ? <Badge bg="success">Yes</Badge> : <Badge bg="danger">No</Badge>}</td>
              <td>
                <Button size="sm" variant="primary" onClick={() => handleEdit(cat)}>Edit</Button>{' '}
                <Button size="sm" variant="danger" onClick={() => handleDelete(cat.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingCategory ? 'Edit Category' : 'Add Category'}</Modal.Title>
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
              <Form.Check type="checkbox" label="Active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingCategory ? 'Update' : 'Add'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement; 