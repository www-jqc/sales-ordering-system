import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { FaUsers, FaTable, FaUtensils, FaMoneyBill, FaClock, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTables: 0,
    totalMenuItems: 0,
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // In a real app, you'd fetch this from your API
      // const response = await axios.get('/api/admin/dashboard-stats');
      // setStats(response.data);
      
      // Mock data for now
      setStats({
        totalUsers: 12,
        totalTables: 8,
        totalMenuItems: 45,
        todayOrders: 23,
        pendingOrders: 5,
        completedOrders: 18,
        todayRevenue: 15420.50
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      color: 'primary',
      bg: 'bg-primary'
    },
    {
      title: 'Total Tables',
      value: stats.totalTables,
      icon: FaTable,
      color: 'success',
      bg: 'bg-success'
    },
    {
      title: 'Menu Items',
      value: stats.totalMenuItems,
      icon: FaUtensils,
      color: 'warning',
      bg: 'bg-warning'
    },
    {
      title: 'Today\'s Orders',
      value: stats.todayOrders,
      icon: FaClock,
      color: 'info',
      bg: 'bg-info'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: FaClock,
      color: 'warning',
      bg: 'bg-warning'
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: FaCheckCircle,
      color: 'success',
      bg: 'bg-success'
    }
  ];

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
    <div>
      <h1 className="mb-4">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-3">
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <div className={`${stat.bg} text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} 
                       style={{ width: '60px', height: '60px' }}>
                    <IconComponent size={24} />
                  </div>
                  <h3 className="mb-1">{stat.value}</h3>
                  <p className="text-muted mb-0">{stat.title}</p>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Revenue Card */}
      <Row>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <FaMoneyBill className="me-2" />
                Today's Revenue
              </h5>
            </Card.Header>
            <Card.Body className="text-center">
              <h2 className="text-success mb-0">
                ₱{stats.todayRevenue.toLocaleString()}
              </h2>
              <p className="text-muted mb-0">Total revenue for today</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <FaCheckCircle className="me-2" />
                Order Status
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Pending:</span>
                <Badge bg="warning">{stats.pendingOrders}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Completed:</span>
                <Badge bg="success">{stats.completedOrders}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Total Today:</span>
                <Badge bg="primary">{stats.todayOrders}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome; 