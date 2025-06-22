import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaPrint, FaDownload } from 'react-icons/fa';

const ReceiptPrinter = ({ show, onHide, transaction }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Order #${transaction?.orderId}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 14px; color: #666; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">HARAH RUBINA DEL DIOS</div>
            <div class="subtitle">Restaurant & Catering Services</div>
            <div>123 Main Street, City, Province</div>
            <div>Tel: (123) 456-7890</div>
          </div>
          
          <div class="divider"></div>
          
          <div>
            <div class="item">
              <span>Receipt #:</span>
              <span>${transaction?.id || 'N/A'}</span>
            </div>
            <div class="item">
              <span>Order #:</span>
              <span>${transaction?.orderId || 'N/A'}</span>
            </div>
            <div class="item">
              <span>Date:</span>
              <span>${new Date(transaction?.timestamp).toLocaleString()}</span>
            </div>
            <div class="item">
              <span>Payment Method:</span>
              <span>${transaction?.paymentMethod?.toUpperCase() || 'N/A'}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="item total">
            <span>Total Amount:</span>
            <span>₱${parseFloat(transaction?.amount || 0).toFixed(2)}</span>
          </div>
          
          ${transaction?.change > 0 ? `
            <div class="item">
              <span>Change:</span>
              <span>₱${transaction.change.toFixed(2)}</span>
            </div>
          ` : ''}
          
          <div class="divider"></div>
          
          <div class="footer">
            <div>Thank you for dining with us!</div>
            <div>Please come again</div>
            <div>This is a computer-generated receipt</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const receiptContent = `
HARAH RUBINA DEL DIOS
Restaurant & Catering Services
123 Main Street, City, Province
Tel: (123) 456-7890

----------------------------------------
Receipt #: ${transaction?.id || 'N/A'}
Order #: ${transaction?.orderId || 'N/A'}
Date: ${new Date(transaction?.timestamp).toLocaleString()}
Payment Method: ${transaction?.paymentMethod?.toUpperCase() || 'N/A'}

----------------------------------------
Total Amount: ₱${parseFloat(transaction?.amount || 0).toFixed(2)}
${transaction?.change > 0 ? `Change: ₱${transaction.change.toFixed(2)}` : ''}
----------------------------------------

Thank you for dining with us!
Please come again
This is a computer-generated receipt
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transaction?.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal show={show} onHide={onHide} size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Print Receipt</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <p>Choose how you would like to handle the receipt:</p>
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={handlePrint}>
              <FaPrint className="me-2" />
              Print Receipt
            </Button>
            <Button variant="outline-primary" onClick={handleDownload}>
              <FaDownload className="me-2" />
              Download as Text
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ReceiptPrinter; 