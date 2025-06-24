import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Table, Form } from 'react-bootstrap';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => { fetchLogs(); }, [userFilter, actionFilter]);

  const fetchLogs = async () => {
    const res = await axios.get('/api/activity-logs', { params: { user: userFilter, action: actionFilter } });
    setLogs(res.data);
  };

  return (
    <Card>
      <Card.Header><h4>Staff Activity Log</h4></Card.Header>
      <Card.Body>
        <Form className="mb-3 d-flex gap-2">
          <Form.Group>
            <Form.Label>User</Form.Label>
            <Form.Control value={userFilter} onChange={e => setUserFilter(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Action</Form.Label>
            <Form.Control value={actionFilter} onChange={e => setActionFilter(e.target.value)} />
          </Form.Group>
        </Form>
        <Table bordered>
          <thead>
            <tr><th>User</th><th>Action</th><th>Date</th></tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.user_name}</td>
                <td>{log.action}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default ActivityLog; 