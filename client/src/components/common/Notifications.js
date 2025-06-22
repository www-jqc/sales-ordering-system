import React, { useContext } from 'react';
import { Card, ListGroup, Badge, Button } from 'react-bootstrap';
import { NotificationContext } from '../../contexts/NotificationContext';

const Notifications = () => {
  const { notifications, markAsRead, clearAll } = useContext(NotificationContext);

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4>Notifications</h4>
        <Button size="sm" variant="outline-danger" onClick={clearAll}>Clear All</Button>
      </Card.Header>
      <ListGroup variant="flush">
        {notifications.length === 0 && <ListGroup.Item>No notifications</ListGroup.Item>}
        {notifications.map(n => (
          <ListGroup.Item key={n.id} className={n.read ? '' : 'fw-bold'}>
            <div className="d-flex justify-content-between align-items-center">
              <span>{n.message}</span>
              <Badge bg={n.read ? 'secondary' : 'primary'}>{n.read ? 'Read' : 'New'}</Badge>
            </div>
            <Button size="sm" variant="link" onClick={() => markAsRead(n.id)}>Mark as read</Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default Notifications; 