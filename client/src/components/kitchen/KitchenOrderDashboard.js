import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Badge } from 'react-bootstrap';
import { SocketContext } from '../../contexts/SocketContext';
import { FaUtensils, FaTasks, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import KitchenOrderCard from './KitchenOrderCard';
import ConnectionStatus from '../common/ConnectionStatus';

const KitchenOrderDashboard = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, connected } = useContext(SocketContext);

  const fetchActiveOrders = async () => {
    try {
      const response = await axios.get('/api/orders?status=PAID');
      setActiveOrders(response.data);
    } catch (error) {
      toast.error('Failed to load active orders');
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const response = await axios.get('/api/orders?status=COMPLETED,DELIVERED');
      setCompletedOrders(response.data);
    } catch (error) {
      toast.error('Failed to load completed orders');
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([fetchActiveOrders(), fetchCompletedOrders()]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (socket && connected) {
      socket.emit('join_room', 'kitchen_updates');

      const handleNewOrder = (orderData) => {
        if (orderData.status === 'PAID') {
          // Play notification sound
          try {
            const audio = new Audio('/notifications.mp3');
            audio.volume = 0.6; // Set volume to 60%
            audio.play().catch(err => {
              console.log('Could not play notification sound:', err);
            });
          } catch (error) {
            console.log('Error creating audio element:', error);
          }
          
          toast.info(`New order #${orderData.id} for preparation!`);
          setActiveOrders(prev => [orderData, ...prev]);
        }
      };
      
      const handleOrderStatusUpdate = (update) => {
        setActiveOrders(prev => prev.filter(o => o.id !== update.order_id));
        if (update.status === 'COMPLETED' || update.status === 'DELIVERED') {
          setCompletedOrders(prev => [update.order, ...prev]);
        }
      };

      socket.on('new_order', handleNewOrder);
      socket.on('order_status_update', handleOrderStatusUpdate);

      return () => {
        socket.off('new_order', handleNewOrder);
        socket.off('order_status_update', handleOrderStatusUpdate);
      };
    }
  }, [socket, connected]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orderId} marked as ${newStatus}!`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };
  
  const renderOrders = (orders, showControls) => {
    if (orders.length === 0) {
      return (
        <Col>
          <Card>
            <Card.Body className="text-center text-muted py-5">
              <FaUtensils size={48} className="mb-3" />
              <h5>No orders here</h5>
            </Card.Body>
          </Card>
        </Col>
      );
    }
    return orders.map(order => (
      <Col key={order.id} xs={12} md={6} lg={4} xl={3} className="mb-4">
        <KitchenOrderCard 
          order={order} 
          onUpdateStatus={showControls ? updateOrderStatus : null} 
        />
      </Col>
    ));
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Order Queue</h4>
        <ConnectionStatus />
      </div>
      
      <Tab.Container defaultActiveKey="active">
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="active">
              <FaTasks className="me-2" />
              Active Orders <Badge bg="primary">{activeOrders.length}</Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="completed">
              <FaHistory className="me-2" />
              Completed Today <Badge bg="secondary">{completedOrders.length}</Badge>
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="active">
            <Row>{renderOrders(activeOrders, true)}</Row>
          </Tab.Pane>
          <Tab.Pane eventKey="completed">
            <Row>{renderOrders(completedOrders, false)}</Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </>
  );
};

export default KitchenOrderDashboard;