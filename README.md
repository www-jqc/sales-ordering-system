# Sales Ordering System

A QR Code-Based Sales and Ordering Management Solution for Harah Rubina Del Dios

## 🚀 Technologies Used

- **Frontend**: React PWA (Progressive Web App)
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Real-time**: Socket.io
- **UI Framework**: Bootstrap
- **QR Code**: qrcode.js

## 👥 User Roles

1. **Customer**: Web-based interface (mobile responsive)
2. **Cashier**: Web-based interface with real-time updates
3. **Kitchen Staff**: PWA interface (tablet/mobile responsive)
4. **Waiter**: PWA interface (mobile responsive)
5. **Admin**: Web-based interface

## 🔄 System Flow

### Customer Interaction
1. Customer scans QR code on table
2. Redirected to web-based menu
3. Browse food/drinks and submit order

### Order Processing
1. Order sent to cashier and kitchen
2. Cashier confirms payment (Cash/GCash)
3. WebSocket notifies kitchen of confirmed order

### Kitchen Workflow
1. Kitchen receives confirmed order
2. Prepares food and marks as COMPLETED
3. WebSocket notifies waiter

### Serving Process
1. Waiter receives notification
2. Delivers food to customer
3. Marks order as DELIVERED

### Table Management
1. Waiter checks and cleans table
2. Marks table as EMPTY
3. System updates to AVAILABLE

## 📁 Project Structure

```
sales-ordering-system/
├── client/                 # React PWA Frontend
│   ├── public/            # Static files
│   ├── src/               # React components
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── services/      # API services
│   └── package.json
├── server/                # Node.js Backend
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   ├── socket/            # WebSocket handlers
│   └── package.json
├── database/              # Database scripts
├── config/                # Configuration files
└── package.json           # Root package.json
```

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Set up MySQL database
4. Configure environment variables
5. Start development:
   ```bash
   npm run dev
   ```

## 🌟 Features

- ✅ QR Code generation and scanning
- ✅ Real-time order updates via WebSocket
- ✅ Mobile responsive PWA
- ✅ Multi-role user interfaces
- ✅ Table management system
- ✅ Order queue management
- ✅ Payment processing
- ✅ Admin dashboard

## 📱 PWA Features

- Installable on home screen
- Offline capability
- Push notifications
- App-like experience
- Fast loading with caching 