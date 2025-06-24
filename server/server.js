const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow connections from any origin for development
    methods: ["GET", "POST"]
  }
});

// Make io accessible to our router so we can emit events from routes
app.set('socketio', io);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Database connection
const { pool, testConnection, initializeDatabase } = require('./config/database');

// Initialize database on startup
const initializeApp = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Initialize the app
initializeApp();

// Socket.io connection handling
const { socketHandler } = require('./socket/socketHandler');
socketHandler(io, app);

// --- Push Notification Setup ---
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  const webPush = require('web-push');

  webPush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'test@example.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  console.log("VAPID keys configured. Push notifications are enabled.");

  // In-memory store for subscriptions. In a real app, use a database.
  let pushSubscriptions = [];

  app.post('/api/push/subscribe', (req, res) => {
    const subscription = req.body;
    if (!pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint)) {
      pushSubscriptions.push(subscription);
      console.log('Subscription added:', subscription.endpoint);
    }
    res.status(201).json({ message: 'Subscribed' });
  });

  // Make the send notification function available to other parts of the app
  app.set('sendPushNotification', (notificationPayload) => {
    const sendPromises = pushSubscriptions.map(subscription =>
      webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
        .catch(error => {
          console.error('Error sending notification, subscription expired or invalid:', error.stack);
          // TODO: Remove invalid subscriptions from your database
          // For now, we'll just filter it out from our in-memory array
          pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== subscription.endpoint);
        })
    );
    return Promise.all(sendPromises);
  });

} else {
  console.warn("VAPID keys not found in .env file. Push notifications will be disabled.");
  
  // Create dummy handlers if keys are not set, to prevent crashes
  app.post('/api/push/subscribe', (req, res) => {
    res.status(412).json({ error: 'Push notifications are not configured on the server.' });
  });
  app.set('sendPushNotification', () => {
    // Return a resolved promise to avoid breaking promise chains
    return Promise.resolve();
  });
}
// --- End Push Notification Setup ---

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/employees', require('./routes/employees'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sales Ordering System is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

module.exports = { app, server, io }; 