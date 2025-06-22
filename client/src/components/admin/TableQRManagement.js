import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Card, Table, Button } from 'react-bootstrap';

const TableQRManagement = () => {
  const [tables, setTables] = useState([]);
  const qrRefs = useRef({});

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    const res = await axios.get('/api/tables');
    setTables(res.data);
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print All Table QRs</title></head><body>');
    tables.forEach(table => {
      printWindow.document.write(`<div style="margin-bottom:20px;text-align:center;"><h3>Table ${table.table_number}</h3><img src='${table.qr_code}' alt='QR' width='150' /></div>`);
    });
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4>Table QR Management</h4>
        <Button onClick={handlePrintAll}>Print All</Button>
      </Card.Header>
      <Table bordered>
        <thead>
          <tr><th>Table #</th><th>QR Code</th></tr>
        </thead>
        <tbody>
          {tables.map(table => (
            <tr key={table.id}>
              <td>{table.table_number}</td>
              <td><img src={table.qr_code} alt={`QR for Table ${table.table_number}`} width={100} /></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default TableQRManagement; 