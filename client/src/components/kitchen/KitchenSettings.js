import React from 'react';
import { Card } from 'react-bootstrap';

const KitchenSettings = () => {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Kitchen Settings</h5>
      </Card.Header>
      <Card.Body>
        <p>This is a placeholder for future kitchen settings.</p>
        <p>Options could include:</p>
        <ul>
          <li>Notification preferences</li>
          <li>Default order sorting</li>
          <li>Timer color thresholds</li>
        </ul>
      </Card.Body>
    </Card>
  );
};

export default KitchenSettings; 