import React, { useContext } from 'react';
import { Badge } from 'react-bootstrap';
import { SocketContext } from '../../contexts/SocketContext';

const ConnectionStatus = () => {
  const { connected, connecting } = useContext(SocketContext);

  if (connecting) {
    return (
      <Badge bg="warning" className="me-2">
        <div className="spinner-border spinner-border-sm me-1" role="status"></div>
        Connecting...
      </Badge>
    );
  }

  if (!connected) {
    return (
      <Badge bg="danger" className="me-2">
        Disconnected
      </Badge>
    );
  }

  return (
    <Badge bg="success" className="me-2">
      Connected
    </Badge>
  );
};

export default ConnectionStatus; 