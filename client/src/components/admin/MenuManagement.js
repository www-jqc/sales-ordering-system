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
  FaDownload
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const MenuManagement = () => {
  const [products, setProducts] = useState([]);
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
    category_id: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  const [showEntries, setShowEntries] = useState(10);
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pagination.currentPage, showEntries, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: showEntries,
        ...filters
      };
      
      const res = await axios.get('/api/menu/admin', { params });
      setProducts(res.data.items);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/menu/categories/all');
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to fetch categories.');
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
    setFilters(prev => ({ 
      ...prev, 
      sortBy: field, 
      sortOrder: newSortOrder 
    }));
  };

  const handleAddProduct = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_available: true,
      image_url: ''
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category_id: item.category_id || '',
      is_available: item.is_available,
      image_url: item.image_url || ''
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This may fail if the product is part of existing orders.')) {
      try {
        await axios.delete(`/api/menu/${productId}`);
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete product.');
      }
    }
  };

  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      await axios.put(`/api/menu/${productId}/availability`, {
        is_available: !currentStatus
      });
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product availability.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setUploading(true);

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const res = await axios.post('/api/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData(prev => ({ ...prev, image_url: res.data.imageUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed.');
      setImageFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required.');
      return;
    }

    try {
      let payload = { ...formData };
      
      if (imageFile) {
        console.log("Image file:", imageFile.name);
      }

      if (editingItem) {
        await axios.put(`/api/menu/${editingItem.id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await axios.post('/api/menu', payload);
        toast.success('Product added successfully!');
      }
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', price: '', category_id: '', is_available: true, image_url: '' });
      setImageFile(null);
      fetchProducts();

    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred.');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      status: '',
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Description', 'Price', 'Category', 'Status', 'Created At'],
      ...products.map(product => [
        product.name,
        product.description || '',
        product.price,
        product.category_name || 'Uncategorized',
        product.is_available ? 'Available' : 'Unavailable',
        new Date(product.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `menu_products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="menu-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Menu Management</h3>
    
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={handleExport}>
            <FaDownload className="me-2" />
            Export
          </Button>
          <Button variant="primary" onClick={handleAddProduct}>
            <FaPlus className="me-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaFilter className="me-2" />
              Filters & Search
            </h5>
            <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Show Entries</Form.Label>
                <Form.Select
                  value={showEntries}
                  onChange={(e) => handleShowEntriesChange(e.target.value)}
                >
                  <option value={5}>5 entries</option>
                  <option value={10}>10 entries</option>
                  <option value={25}>25 entries</option>
                  <option value={50}>50 entries</option>
                  <option value={100}>100 entries</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Products ({pagination.totalRecords} total)</h5>
            {loading && <Spinner animation="border" size="sm" />}
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No products found.</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }}>Image</th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('name')}
                  >
                    Name
                    <FaSort className="ms-1" />
                  </th>
                  <th>Description</th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('price')}
                  >
                    Price
                    <FaSort className="ms-1" />
                  </th>
                  <th>Category</th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('is_available')}
                  >
                    Status
                    <FaSort className="ms-1" />
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('created_at')}
                  >
                    Created
                    <FaSort className="ms-1" />
                  </th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(item => (
                  <tr key={item.id}>
                    <td>
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            objectFit: 'cover', 
                            borderRadius: '5px' 
                          }} 
                        />
                      ) : (
                        <div 
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            backgroundColor: '#f8f9fa', 
                            borderRadius: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6c757d',
                            fontSize: '10px'
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <span className="text-muted">
                        {item.description ? 
                          (item.description.length > 50 ? 
                            `${item.description.substring(0, 50)}...` : 
                            item.description
                          ) : 
                          'No description'
                        }
                      </span>
                    </td>
                    <td>
                      <strong className="text-success">₱{parseFloat(item.price).toFixed(2)}</strong>
                    </td>
                    <td>
                      <Badge bg="secondary">
                        {item.category_name || 'Uncategorized'}
                      </Badge>
                    </td>
                    <td>
                      {item.is_available ? (
                        <Badge bg="success">Available</Badge>
                      ) : (
                        <Badge bg="danger">Unavailable</Badge>
                      )}
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(item.created_at).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={item.is_available ? "outline-warning" : "outline-success"}
                          onClick={() => handleToggleAvailability(item.id, item.is_available)}
                          title={item.is_available ? "Deactivate" : "Activate"}
                        >
                          {item.is_available ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger" 
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
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
            <Pagination.First 
              onClick={() => handlePageChange(1)}
              disabled={!pagination.hasPrevPage}
            />
            <Pagination.Prev 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            />
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(
                pagination.totalPages - 4,
                pagination.currentPage - 2
              )) + i;
              if (page <= pagination.totalPages) {
                return (
                  <Pagination.Item
                    key={page}
                    active={page === pagination.currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                );
              }
              return null;
            })}
            
            <Pagination.Next 
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            />
            <Pagination.Last 
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={!pagination.hasNextPage}
            />
          </Pagination>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    required 
                    placeholder="Enter product name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>₱</InputGroup.Text>
                    <Form.Control 
                      type="number" 
                      step="0.01" 
                      value={formData.price} 
                      onChange={e => setFormData({ ...formData, price: e.target.value })} 
                      required 
                      placeholder="0.00"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Enter product description"
              />
            </Form.Group>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select 
                    value={formData.category_id} 
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Select a Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch" 
                id="is-available-switch" 
                label="Product is available" 
                checked={formData.is_available} 
                onChange={e => setFormData({ ...formData, is_available: e.target.checked })} 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Upload Image (Optional)</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && <Spinner animation="border" size="sm" className="mt-2" />}
              {formData.image_url && !uploading && (
                <div className="mt-2">
                  <img 
                    src={formData.image_url} 
                    alt="preview" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} 
                  />
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingItem ? 'Update Product' : 'Add Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;