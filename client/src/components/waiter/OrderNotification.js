import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBell, FaUtensils, FaCheckCircle } from 'react-icons/fa';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'ready': return <FaUtensils className="text-success" />;
    case 'new': return <FaBell className="text-primary" />;
    case 'request': return <FaCheckCircle className="text-warning" />;
    default: return <FaBell />;
  }
};

const OrderNotification = ({ socket, onNewNotification }) => {
  useEffect(() => {
    if (!socket) return;

    // Join waiter room for notifications
    socket.emit('join_room', 'waiter_updates');

    const playNotificationSound = () => {
      try {
        const audio = new Audio('/notifications.mp3');
        audio.volume = 0.6;
        audio.play().catch(err => {
          console.log('Could not play notification sound:', err);
        });
      } catch (error) {
        console.log('Error creating audio element:', error);
      }
    };

    const showToast = (notification) => {
      const { type, message } = notification;
      const icon = getNotificationIcon(type);

      switch (type) {
        case 'ready':
          toast.success(message, { icon });
          break;
        case 'new':
          toast.info(message, { icon });
          break;
        case 'request':
          toast.warning(message, { icon });
          break;
        default:
          toast(message, { icon });
      }
    };

    const handleNewNotification = (notificationData) => {
      playNotificationSound();
      if (onNewNotification) {
        onNewNotification();
      }
      showToast(notificationData);
    };

    const orderReadyHandler = (orderData) => {
      handleNewNotification({
        id: Date.now(),
        type: 'ready',
        title: 'Order Ready',
        message: `Order #${orderData.orderId} from Table ${orderData.tableId} is ready!`,
        orderData: orderData,
      });
    };

    const newOrderHandler = (orderData) => {
      handleNewNotification({
        id: Date.now(),
        type: 'new',
        title: 'New Order',
        message: `New order #${orderData.id} from Table ${orderData.table_id}`,
        orderData: orderData,
      });
    };

    const customerRequestHandler = (requestData) => {
      handleNewNotification({
        id: Date.now(),
        type: 'request',
        title: 'Customer Request',
        message: `Table ${requestData.tableId} needs assistance`,
        requestData: requestData,
      });
    };

    socket.on('order_ready', orderReadyHandler);
    socket.on('new_order', newOrderHandler);
    socket.on('assistance_request', customerRequestHandler);

    return () => {
      socket.off('order_ready', orderReadyHandler);
      socket.off('new_order', newOrderHandler);
      socket.off('assistance_request', customerRequestHandler);
      socket.emit('leave_room', 'waiter_updates');
    };
  }, [socket, onNewNotification]);

  return null; // This component does not render anything itself
};

export default OrderNotification; 