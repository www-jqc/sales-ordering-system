const socketHandler = (io, app) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      console.log(`Client ${socket.id} joined room: ${roomName}`);
    });

    socket.on('leave_room', (roomName) => {
      socket.leave(roomName);
      console.log(`Client ${socket.id} left room: ${roomName}`);
    });

    socket.on('customer_request', (data) => {
      // Notify all staff rooms (waiter, cashier, admin)
      io.to('waiter_updates').to('cashier_updates').to('admin_updates').emit('assistance_request', data);
      console.log(`Assistance requested:`, data);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

// Helper function to broadcast new orders
const broadcastNewOrder = (io, order) => {
  io.to('cashier_updates').to('kitchen_updates').emit('new_order', order);
  console.log(`Broadcasting new order #${order.id} to cashiers and kitchen.`);
};

// Helper function to broadcast status updates
const broadcastStatusUpdate = (io, order, app) => {
  const { id, status, table_id } = order;
  const updateData = { order_id: id, status, order };
  const sendPushNotification = app.get('sendPushNotification');

  // Notify relevant rooms based on status
  io.to(`table_${table_id}`).emit('order_status_update', updateData);
  
  if (status === 'PAID') {
    io.to('kitchen_updates').emit('order_status_update', updateData);
  } else if (status === 'COMPLETED') {
    io.to('waiter_updates').emit('order_status_update', updateData);
    
    // Send a push notification to all subscribed waiters
    if (sendPushNotification) {
      const payload = {
        title: 'Order Ready!',
        body: `Order #${id} for Table ${table_id} is ready for pickup.`,
        url: '/waiter'
      };
      sendPushNotification(payload)
        .then(() => console.log('Push notification sent successfully.'))
        .catch(err => console.error('Error sending push notification:', err));
    }
  }
  
  // Always notify admin and cashier of all status changes
  io.to('admin_updates').to('cashier_updates').emit('order_status_update', updateData);
  console.log(`Broadcasting status update for order #${id} to ${status}`);
};

module.exports = {
  socketHandler,
  broadcastNewOrder,
  broadcastStatusUpdate
}; 