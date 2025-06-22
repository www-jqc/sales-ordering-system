import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Card, Table, Badge } from 'react-bootstrap';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    fetchOrder();
    fetchTransaction();
  }, [orderId]);

  const fetchOrder = async () => {
    const res = await axios.get(`/api/orders/${orderId}`);
    setOrder(res.data);
  };

  const fetchTransaction = async () => {
    const res = await axios.get(`/api/transactions?order_id=${orderId}`);
    setTransaction(res.data[0] || null);
  };

  if (!order) return <div>Loading...</div>;

  return (
    <Card>
      <Card.Header>
        <h4>Order #{order.id} Details</h4>
      </Card.Header>
      <Card.Body>
        <div><strong>Status:</strong> <Badge bg="info">{order.status}</Badge></div>
        <div><strong>Table:</strong> {order.table_id}</div>
        <div><strong>Customer:</strong> {order.customer_name}</div>
        <div><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</div>
        <hr />
        <h5>Items</h5>
        <Table bordered>
          <thead>
            <tr><th>Name</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>₱{parseFloat(item.unit_price).toFixed(2)}</td>
                <td>₱{parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div><strong>Total:</strong> ₱{parseFloat(order.total_amount).toFixed(2)}</div>
        <hr />
        {transaction && (
          <div>
            <h5>Payment</h5>
            <div><strong>Method:</strong> {transaction.payment_method}</div>
            <div><strong>Amount Received:</strong> ₱{parseFloat(transaction.amount_received).toFixed(2)}</div>
            <div><strong>Change:</strong> ₱{parseFloat(transaction.change_returned).toFixed(2)}</div>
            <div><strong>Paid At:</strong> {new Date(transaction.created_at).toLocaleString()}</div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default OrderDetails; 