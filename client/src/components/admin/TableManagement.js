import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Table, Form, Modal, Row, Col, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaQrcode, FaDownload, FaPrint } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    table_number: '',
    status: 'available'
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState({ url: '', tableNumber: '' });
  const qrCodeRef = useRef(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get('/api/tables');
      setTables(response.data);
    } catch (error) {
      toast.error('Failed to fetch tables');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSend = {
      ...formData,
      table_number: parseInt(formData.table_number, 10),
    };

    try {
      if (editingTable) {
        await axios.put(`/api/tables/${editingTable.id}`, dataToSend);
        toast.success('Table updated successfully');
      } else {
        await axios.post('/api/tables', dataToSend);
        toast.success('Table added successfully');
      }
      
      fetchTables();
      handleCloseModal();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save table';
      toast.error(errorMsg);
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      table_number: table.table_number,
      status: table.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await axios.delete(`/api/tables/${id}`);
        toast.success('Table deleted successfully');
        fetchTables();
      } catch (error) {
        toast.error('Failed to delete table');
      }
    }
  };

  const generateQRCode = async (table) => {
    try {
      const response = await axios.get(`/api/tables/${table.id}/qr-code`);
      setQrCodeData({ url: response.data.qr_code_data, tableNumber: table.table_number });
      setShowQRModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTable(null);
    setFormData({
      table_number: '',
      status: 'available'
    });
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print QR Code</title>');
    printWindow.document.write('<style>@media print { body { -webkit-print-color-adjust: exact; } }</style>');
    printWindow.document.write('</head><body style="text-align:center;">');
    printWindow.document.write(`<h2>Table ${qrCodeData.tableNumber}</h2>`);
    printWindow.document.write(qrCodeRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Table Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" />
          Add New Table
        </Button>
      </div>

      <Card>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Table #</th>
                <th>Status</th>
                <th>QR Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.length > 0 ? (
                tables.map(table => (
                  <tr key={table.id}>
                    <td>{table.table_number}</td>
                    <td>
                      <Badge bg={table.status === 'available' ? 'success' : 'warning'}>
                        {table.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => generateQRCode(table)}
                      >
                        <FaQrcode />
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(table)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(table.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No tables found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTable ? 'Edit Table' : 'Add New Table'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Table Number</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.table_number}
                    onChange={(e) => setFormData({...formData, table_number: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="empty">Empty</option>
                    </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingTable ? 'Update' : 'Add'} Table
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* QR Code Modal */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>QR Code for Table {qrCodeData.tableNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div ref={qrCodeRef}>
            <img src={qrCodeData.url} alt={`QR Code for Table ${qrCodeData.tableNumber}`} className="img-fluid" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handlePrintQR}>
            <FaPrint className="me-2" />
            Print
          </Button>
          <a href={qrCodeData.url} download={`table-${qrCodeData.tableNumber}-qrcode.png`} className="btn btn-primary">
            <FaDownload className="me-2" />
            Download
          </a>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TableManagement; 