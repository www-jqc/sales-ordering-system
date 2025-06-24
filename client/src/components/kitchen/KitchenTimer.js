import React, { useState, useEffect } from 'react';
import { Card, Button, ProgressBar, Badge } from 'react-bootstrap';
import { FaClock, FaPlay, FaPause, FaStop, FaCheckCircle } from 'react-icons/fa';

const KitchenTimer = ({ orderId, estimatedTime, onComplete, onUpdate }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prevTime => {
          const newTime = prevTime + 1;
          
          // Check if time is up
          if (newTime >= estimatedTime * 60) {
            setIsRunning(false);
            setIsCompleted(true);
            if (onComplete) onComplete(orderId);
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isCompleted, estimatedTime, orderId, onComplete]);

  const startTimer = () => {
    setIsRunning(true);
    if (onUpdate) onUpdate(orderId, 'preparing');
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsCompleted(true);
    if (onComplete) onComplete(orderId);
  };

  const resetTimer = () => {
    setTimeElapsed(0);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return Math.min((timeElapsed / (estimatedTime * 60)) * 100, 100);
  };

  const getStatusColor = () => {
    if (isCompleted) return 'success';
    if (timeElapsed >= estimatedTime * 60) return 'danger';
    if (timeElapsed >= estimatedTime * 60 * 0.8) return 'warning';
    return 'info';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (timeElapsed >= estimatedTime * 60) return 'Overdue';
    if (timeElapsed >= estimatedTime * 60 * 0.8) return 'Almost Done';
    return 'In Progress';
  };

  return (
    <Card className="mb-2">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h6 className="mb-1">Order #{orderId}</h6>
            <small className="text-muted">
              Estimated: {estimatedTime} minutes
            </small>
          </div>
          <Badge bg={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        <div className="text-center mb-3">
          <div className="h4 mb-1">
            <FaClock className="me-2" />
            {formatTime(timeElapsed)}
          </div>
          <small className="text-muted">
            {formatTime(estimatedTime * 60)} target
          </small>
        </div>

        <ProgressBar 
          now={getProgressPercentage()} 
          variant={getStatusColor()}
          className="mb-3"
        />

        <div className="d-flex gap-2 justify-content-center">
          {!isCompleted ? (
            <>
              {!isRunning ? (
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={startTimer}
                >
                  <FaPlay />
                </Button>
              ) : (
                <Button 
                  variant="warning" 
                  size="sm"
                  onClick={pauseTimer}
                >
                  <FaPause />
                </Button>
              )}
              
              <Button 
                variant="danger" 
                size="sm"
                onClick={stopTimer}
              >
                <FaStop />
              </Button>
            </>
          ) : (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={resetTimer}
            >
              <FaCheckCircle className="me-1" />
              Reset
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default KitchenTimer; 