import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Form, Modal, Row, Col, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const initialFormData = {
    name: '',
    position: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: '',
    is_active: true
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name || '',
      position: emp.position,
      hire_date: emp.hire_date ? new Date(emp.hire_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      salary: emp.salary || '',
      is_active: emp.is_active === 1 || emp.is_active === true
    });
    setShowModal(true);
  };

  const handleDelete = async (empId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`/api/employees/${empId}`);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete employee');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingEmployee) {
        await axios.put(`/api/employees/${editingEmployee.id}`, payload);
        toast.success('Employee updated successfully');
      } else {
        await axios.post('/api/employees', payload);
        toast.success('Employee added successfully');
      }
      fetchEmployees();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData(initialFormData);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Employee Management</h2>
        <Button variant="primary" onClick={() => { setEditingEmployee(null); setFormData(initialFormData); setShowModal(true); }}>
          <FaPlus className="me-2" />
          Add New Employee
        </Button>
      </div>
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Position</th>
                <th>Hire Date</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.name || 'N/A'}</td>
                  <td>{emp.gender ? emp.gender.charAt(0).toUpperCase() + emp.gender.slice(1) : 'N/A'}</td>
                  <td>{emp.position}</td>
                  <td>{emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{emp.salary ? `₱${parseFloat(emp.salary).toFixed(2)}` : 'N/A'}</td>
                  <td>
                    <Badge bg={emp.is_active ? 'success' : 'secondary'}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(emp)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(emp.id)}
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
            {editingEmployee ? `Edit Employee: ${editingEmployee.name}` : 'Add New Employee'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Position</Form.Label>
              <Form.Control value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hire Date</Form.Label>
              <Form.Control type="date" value={formData.hire_date} onChange={e => setFormData({...formData, hire_date: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Salary</Form.Label>
              <Form.Control type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} min="0" step="0.01" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Select value={formData.gender || ''} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3 pt-2">
              <Form.Check type="switch" id="is-active-switch" label="Employee is Active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingEmployee ? 'Save Changes' : 'Add Employee'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default EmployeeManagement; 