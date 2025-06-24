import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Modal, Row, Col, Badge, Tab, Nav, Tabs } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaUserShield, FaUserTie } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const initialFormData = {
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'waiter',
    is_active: true,
    position: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: ''
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      password: '', // Password is not sent back, so leave it blank for editing
      role: user.role,
      is_active: user.is_active,
      position: user.position || '',
      hire_date: user.hire_date ? new Date(user.hire_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      salary: user.salary || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password;
        }
        await axios.put(`/api/users/${editingUser.user_id}`, payload);
        toast.success('User updated successfully');
      } else {
        await axios.post('/api/users', formData);
        toast.success('User added successfully');
      }
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(initialFormData);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <Badge bg="danger">Admin</Badge>;
      case 'CASHIER': return <Badge bg="warning">Cashier</Badge>;
      case 'KITCHEN': return <Badge bg="info">Kitchen</Badge>;
      case 'WAITER': return <Badge bg="primary">Waiter</Badge>;
      default: return <Badge bg="secondary">{role}</Badge>;
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        <Button variant="primary" onClick={() => { setEditingUser(null); setFormData(initialFormData); setShowModal(true); }}>
          <FaPlus className="me-2" />
          Add New User
        </Button>
      </div>

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.user_id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <Badge bg={user.is_active ? 'success' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(user)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(user.user_id)}
                      disabled={user.role === 'admin'}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="md">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? `Edit User: ${editingUser.name}` : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? "Leave blank to keep current" : ""} required={!editingUser} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required>
                <option value="waiter">Waiter</option>
                <option value="kitchen">Kitchen</option>
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3 pt-2">
              <Form.Check type="switch" id="is-active-switch" label="User is Active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default UserManagement; 