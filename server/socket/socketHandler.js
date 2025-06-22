module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // Join a room based on user role or page
    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    // Handle order status updates from the kitchen
    socket.on('status_update', (updateData) => {
      // Broadcast to relevant rooms
      io.to('cashier').to('waiter').to('customer').emit('status_update', updateData);
      console.log(`Order status updated:`, updateData);
    });
    
    // Handle order ready notifications from the kitchen
    socket.on('order_ready', (orderData) => {
      io.to('waiter').emit('order_ready', orderData);
      console.log(`Order ready for serving:`, orderData);
    });

    // Handle customer requests for assistance
    socket.on('customer_request', (requestData) => {
      io.to('waiter').emit('customer_request', requestData);
      console.log(`Customer request from table ${requestData.tableId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔥 User disconnected: ${socket.id}`);
    });
  });
}; 