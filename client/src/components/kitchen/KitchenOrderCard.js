import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Custom hook for the timer
const useOrderTimer = (startTime) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const calculateElapsed = () => {
            const now = new Date();
            const start = new Date(startTime);
            return Math.floor((now - start) / 1000);
        };

        setElapsed(calculateElapsed());

        const interval = setInterval(() => {
            setElapsed(calculateElapsed());
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        const minutes = elapsed / 60;
        if (minutes > 10) return 'danger'; // Red for > 10 mins
        if (minutes > 5) return 'warning'; // Yellow for > 5 mins
        return 'success'; // Green for < 5 mins
    };

    return { formattedTime: formatTime(elapsed), timerColor: getTimerColor() };
};

const KitchenOrderCard = ({ order, onUpdateStatus }) => {
    const { formattedTime, timerColor } = useOrderTimer(order.paid_at || order.created_at);

    return (
        <Card className={`h-100 shadow-sm order-card border-${timerColor} border-2`}>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                    <strong>Order #{order.id}</strong>
                    <Badge bg="primary" className="ms-2">{order.status}</Badge>
                </div>
                {order.status === 'PAID' && (
                    <div className={`fw-bold text-${timerColor}`}>
                        <FaClock className="me-1" />
                        {formattedTime}
                    </div>
                )}
            </Card.Header>
            <Card.Body>
                <div className="mb-2">
                    <strong>Table {order.table_number}</strong>
                    <span className="text-muted ms-2">- {order.customer_name}</span>
                </div>

                <h6>Items:</h6>
                <div className="mb-3 order-items-container">
                    {order.order_items && order.order_items.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                            <div>
                                <strong>{item.product_name}</strong>
                                <small className="text-muted ms-2">x{item.quantity}</small>
                                {item.notes && <p className="text-info small mb-0">Note: {item.notes}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                {order.special_instructions && (
                    <div className="notes-section border-top pt-2">
                        <p><strong>Order Notes:</strong> {order.special_instructions}</p>
                    </div>
                )}
                
                {onUpdateStatus && order.status === 'PAID' && (
                    <div className="d-flex flex-column align-items-stretch border-top pt-3">
                        <Button 
                            variant="success" 
                            size="lg"
                            className="mb-2"
                            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                        >
                            <FaCheckCircle className="me-2" />
                            Mark as Completed
                        </Button>
                        <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
                        >
                            <FaTimesCircle className="me-1" />
                            Cancel Order
                        </Button>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default KitchenOrderCard; 