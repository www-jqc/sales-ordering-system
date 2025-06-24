import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { FaCog, FaSave } from 'react-icons/fa';

const SystemSettings = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>System Settings</h2>
        <Button variant="primary">
          <FaSave className="me-2" />
          Save Settings
        </Button>
      </div>

      <Card>
        <Card.Body>
          <div className="text-center py-5">
            <FaCog className="text-muted mb-3" size={48} />
            <h5>System Settings</h5>
            <p className="text-muted">This component will allow configuration of system-wide settings.</p>
            <p className="text-muted">Features will include:</p>
            <ul className="text-muted text-start">
              <li>Restaurant information and branding</li>
              <li>Business settings (tax rates, service charges)</li>
              <li>System features configuration</li>
              <li>Notification settings</li>
              <li>System status monitoring</li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SystemSettings; 