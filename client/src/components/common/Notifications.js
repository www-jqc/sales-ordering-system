import React, { useState, useEffect, useContext } from 'react';
import { Badge, Dropdown, Button, Toast, ToastContainer } from 'react-bootstrap';
import { FaBell, FaCheckCircle } from 'react-icons/fa';
import { SocketContext } from '../../contexts/SocketContext';
import axios from 'axios';
import { toast as toastify } from 'react-toastify';

// Custom time formatting function
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        toastify.info(notification.message);
      });

      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
    } catch (error) {
      toastify.error("Failed to mark notification as read.");
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read/all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
       toastify.error("Failed to mark all notifications as read.");
    }
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" id="dropdown-notifications" className="text-decoration-none position-relative">
        <FaBell size="1.5em" />
        {unreadCount > 0 && (
          <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: '350px', maxHeight: '400px', overflowY: 'auto' }}>
        <Dropdown.Header className="d-flex justify-content-between align-items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" onClick={markAllAsRead}>Mark all as read</Button>
          )}
        </Dropdown.Header>
        <Dropdown.Divider />
        {notifications.length > 0 ? (
          notifications.map(n => (
            <Dropdown.Item key={n.notification_id} className={`d-flex align-items-start p-2 ${!n.is_read ? 'bg-light' : ''}`} onClick={() => !n.is_read && markAsRead(n.notification_id)}>
              <div className="flex-grow-1">
                <p className="mb-1 small">{n.message}</p>
                <small className="text-muted">{formatTimeAgo(n.created_at)}</small>
            </div>
              {!n.is_read && <Badge pill bg="primary" className="ms-3 align-self-center">New</Badge>}
            </Dropdown.Item>
          ))
        ) : (
          <Dropdown.ItemText className="text-center text-muted">No notifications</Dropdown.ItemText>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default Notifications; 