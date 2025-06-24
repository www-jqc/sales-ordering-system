import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Button, 
  Table, 
  Modal, 
  Form, 
  Badge, 
  InputGroup, 
  FormControl, 
  Row, 
  Col, 
  Card,
  Pagination,
  Spinner
} from 'react-bootstrap';
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaSort,
  FaFilter,
  FaList
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    sortOrder: 'ASC'
  });

  const [showEntries, setShowEntries] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, [pagination.currentPage, showEntries, filters]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: showEntries,
        ...filters
      };
      const res = await axios.get('/api/menu/categories', { params });
      setCategories(res.data.items);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleShowEntriesChange = (value) => {
    setShowEntries(parseInt(value));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSort = (field) => {
    const newSortOrder = filters.sortBy === field && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    setFilters(prev => ({ ...prev, sortBy: field, sortOrder: newSortOrder }));
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', is_active: true });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/menu/categories/${categoryId}`);
        toast.success('Category deleted successfully!');
        fetchCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category.');
      }
    }
  };
  
  const handleToggleActive = async (category) => {
    try {
      const updatedCategory = { ...category, is_active: !category.is_active };
      await axios.put(`/api/menu/categories/${category.id}`, updatedCategory);
      toast.success(`Category ${updatedCategory.is_active ? 'activated' : 'deactivated'}`);
      fetchCategories();
    } catch(err) {
      toast.error('Failed to update category status.');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required.');
      return;
    }

    try {
      if (editingCategory) {
        await axios.put(`/api/menu/categories/${editingCategory.id}`, formData);
        toast.success('Category updated successfully!');
      } else {
        await axios.post('/api/menu/categories', formData);
        toast.success('Category added successfully!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred.');
    }
  };

  const clearFilters = () => {
    setFilters({ search: '', sortBy: 'name', sortOrder: 'ASC' });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Category Management</h3>
        <Button onClick={handleAdd}>
          <FaPlus className="me-2" />
          Add Category
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0"><FaFilter className="me-2" />Filters & Search</h5>
            <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <FormControl
                    placeholder="Search categories by name or description..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Show Entries</Form.Label>
                <Form.Select
                  value={showEntries}
                  onChange={(e) => handleShowEntriesChange(e.target.value)}
                >
                  <option value={5}>5 entries</option>
                  <option value={10}>10 entries</option>
                  <option value={25}>25 entries</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Categories ({pagination.totalRecords} total)</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    Name <FaSort className="ms-1" />
                  </th>
                  <th>Description</th>
                  <th onClick={() => handleSort('product_count')} style={{ cursor: 'pointer' }}>
                    Products <FaSort className="ms-1" />
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td><strong>{cat.name}</strong></td>
                    <td>{cat.description}</td>
                    <td><Badge bg="info">{cat.product_count}</Badge></td>
                    <td>
                      {cat.is_active ? (
                        <Badge bg="success">Active</Badge>
                      ) : (
                        <Badge bg="danger">Inactive</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-primary" onClick={() => handleEdit(cat)} title="Edit"><FaEdit /></Button>
                        <Button size="sm" variant={cat.is_active ? "outline-warning" : "outline-success"} onClick={() => handleToggleActive(cat)} title={cat.is_active ? "Deactivate" : "Activate"}>
                          {cat.is_active ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(cat.id)} title="Delete"><FaTrash /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{' '}
            {pagination.totalRecords} entries
          </div>
          <Pagination>
            <Pagination.Prev onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrevPage} />
            <Pagination.Item>{pagination.currentPage}</Pagination.Item>
            <Pagination.Next onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNextPage} />
          </Pagination>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingCategory ? 'Edit Category' : 'Add Category'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name *</Form.Label>
              <Form.Control value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </Form.Group>
            <Form.Check type="switch" label="Is Active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
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