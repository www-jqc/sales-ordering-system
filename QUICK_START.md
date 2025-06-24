# Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (XAMPP/WAMP/MAMP)
- Git

### 1. Database Setup
1. Open your MySQL client (phpMyAdmin if using XAMPP)
2. Create a new database named `sales_ordering_system`
3. The tables will be created automatically when you first run the server

### 2. Environment Configuration
1. Copy the environment file:
   ```bash
   copy config\env.example .env
   ```
2. Edit `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=sales_ordering_system
   ```

### 3. Installation
Run the installation script:
```bash
install.bat
```

Or manually install dependencies:
```bash
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 4. Start Development
```bash
npm run dev
```

This will start both:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📱 PWA Features

### Installing on Mobile
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" option
3. The app will work like a native mobile app

### QR Code Testing
1. Go to Admin Dashboard
2. Generate QR codes for tables
3. Scan with your phone to test the customer interface

## 👥 User Roles

### Customer (Public)
- URL: http://localhost:3000/menu/{tableId}
- Mobile responsive web interface
- Browse menu and place orders

### Staff Interfaces (Login Required)
- Cashier: http://localhost:3000/cashier
- Kitchen: http://localhost:3000/kitchen
- Waiter: http://localhost:3000/waiter
- Admin: http://localhost:3000/admin

## 🔧 Development

### Project Structure
```
sales-ordering-system/
├── client/          # React PWA Frontend
├── server/          # Node.js Backend
├── database/        # Database scripts
└── config/          # Configuration files
```

### Key Features
- ✅ Real-time updates via WebSocket
- ✅ Mobile responsive PWA
- ✅ QR code generation
- ✅ Multi-role user system
- ✅ Order management
- ✅ Table management

## 🐛 Troubleshooting

### Common Issues
1. **Port already in use**: Change PORT in .env file
2. **Database connection failed**: Check MySQL credentials
3. **PWA not working**: Ensure HTTPS in production

### Support
For issues, check the main README.md file for detailed documentation. 


then change the env file ip address  go to the env file at the serer file then env file then ctrl + f then write this ip 192.168.1.243 then change with your wifi ip address so it will connect to your phone 

