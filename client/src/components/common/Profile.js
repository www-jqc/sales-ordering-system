import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Alert } from 'react-bootstrap';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', newPassword: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    const res = await axios.get('/api/users/me');
    setProfile(res.data);
    setFormData({ name: res.data.name, email: res.data.email, password: '', newPassword: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${profile.id}`, formData);
      setSuccess('Profile updated!');
      setError('');
    } catch (err) {
      setError('Failed to update profile');
      setSuccess('');
    }
  };

  return (
    <Card>
      <Card.Header><h4>My Profile</h4></Card.Header>
      <Card.Body>
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Current Password</Form.Label>
            <Form.Control type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control type="password" value={formData.newPassword} onChange={e => setFormData({ ...formData, newPassword: e.target.value })} />
          </Form.Group>
          <Button type="submit" variant="primary">Update Profile</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Profile; 