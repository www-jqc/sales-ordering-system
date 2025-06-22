import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaBell, FaUtensils, FaCheckCircle } from 'react-icons/fa';

const OrderNotification = ({ socket }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (socket) {
      // Listen for new order notifications
      socket.on('order_ready', (orderData) => {
        addNotification({
          id: Date.now(),
          type: 'ready',
          title: 'Order Ready',
          message: `Order #${orderData.orderId} from Table ${orderData.tableId} is ready to serve!`,
          orderData: orderData,
          timestamp: new Date()
        });
      });

      // Listen for new order notifications
      socket.on('new_order', (orderData) => {
        addNotification({
          id: Date.now(),
          type: 'new',
          title: 'New Order',
          message: `New order #${orderData.id} received from Table ${orderData.table_id}`,
          orderData: orderData,
          timestamp: new Date()
        });
      });

      // Listen for customer requests
      socket.on('customer_request', (requestData) => {
        addNotification({
          id: Date.now(),
          type: 'request',
          title: 'Customer Request',
          message: `Table ${requestData.tableId} needs assistance`,
          requestData: requestData,
          timestamp: new Date()
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('order_ready');
        socket.off('new_order');
        socket.off('customer_request');
      }
    };
  }, [socket]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only last 5 notifications
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ready': return <FaUtensils className="text-success" />;
      case 'new': return <FaBell className="text-primary" />;
      case 'request': return <FaCheckCircle className="text-warning" />;
      default: return <FaBell />;
    }
  };

  const getNotificationVariant = (type) => {
    switch (type) {
      case 'ready': return 'success';
      case 'new': return 'primary';
      case 'request': return 'warning';
      default: return 'info';
    }
  };

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          onClose={() => removeNotification(notification.id)}
          show={true}
          delay={8000}
          autohide
          bg={getNotificationVariant(notification.type)}
        >
          <Toast.Header>
            {getNotificationIcon(notification.type)}
            <strong className="me-auto ms-2">{notification.title}</strong>
            <small>{notification.timestamp.toLocaleTimeString()}</small>
          </Toast.Header>
          <Toast.Body className="text-white">
            {notification.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default OrderNotification; 