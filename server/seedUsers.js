const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');
require('dotenv').config();

const usersToSeed = [
  {
    name: 'Admin User',
    username: 'admin',
    email: 'admin@restaurant.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Cashier Staff',
    username: 'cashier',
    email: 'cashier@restaurant.com',
    password: 'password123',
    role: 'cashier',
  },
  {
    name: 'Kitchen Staff',
    username: 'kitchen',
    email: 'kitchen@restaurant.com',
    password: 'password123',
    role: 'kitchen',
  },
  {
    name: 'Waiter Staff',
    username: 'waiter',
    email: 'waiter@restaurant.com',
    password: 'password123',
    role: 'waiter',
  },
];

const seedUsers = async () => {
  console.log('🌱 Starting user seeding script...');

  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection acquired.');

    for (const userData of usersToSeed) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      console.log(`\nProcessing user: ${userData.email}`);

      // Check if the user already exists
      const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [userData.email]);

      if (existingUsers.length > 0) {
        // If user exists, update them
        console.log(`   -> User exists. Updating password and role...`);
        await connection.query(
          'UPDATE users SET password = ?, role = ?, is_active = ? WHERE email = ?',
          [hashedPassword, userData.role, true, userData.email]
        );
        console.log(`   -> ✅ ${userData.role} user updated successfully.`);
      } else {
        // If user does not exist, create them
        console.log(`   -> User not found. Creating...`);
        await connection.query(
          "INSERT INTO users (name, username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?, ?)",
          [userData.name, userData.username, userData.email, hashedPassword, userData.role, true]
        );
        console.log(`   -> ✅ ${userData.role} user created successfully.`);
      }
    }

    connection.release();
    console.log('\n🌱 Seed script finished successfully.');
    
  } catch (error) {
    console.error('❌ An error occurred during the seed script:');
    console.error(error);
  } finally {
    // End the process
    pool.end();
  }
};

seedUsers(); 