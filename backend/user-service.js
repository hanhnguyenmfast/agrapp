// user-service.js
const express = require('express');
const { Spanner } = require('@google-cloud/spanner');
const { PubSub } = require('@google-cloud/pubsub');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Google Cloud services
const spanner = new Spanner({
  projectId: 'your-project-id',
});
const instance = spanner.instance('agriculture-instance');
const userDatabase = instance.database('user-database');
const pubsub = new PubSub();

// Auth middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Role-based access control
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userData.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Register a new user
app.post('/users/register', async (req, res) => {
  try {
    // Check if email already exists
    const [existingUsers] = await userDatabase.run({
      sql: 'SELECT userId FROM Users WHERE email = @email',
      params: { email: req.body.email },
    });

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new user
    const user = {
      userId: spanner.datastore.uuid(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || 'farmer', // Default role is farmer
      phone: req.body.phone || null,
      createdAt: spanner.timestamp(),
      lastLogin: null,
      active: true,
    };

    await userDatabase.table('Users').insert([user]);

    // Publish event for user creation
    const topic = pubsub.topic('user-events');
    const data = JSON.stringify({
      event: 'user-created',
      userId: user.userId,
      timestamp: new Date().toISOString(),
    });
    await topic.publish(Buffer.from(data));

    // Don't return the password
    delete user.password;
    res.status(201).json(user);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login
app.post('/users/login', async (req, res) => {
  try {
    // Find user by email
    const [users] = await userDatabase.run({
      sql: 'SELECT * FROM Users WHERE email = @email',
      params: { email: req.body.email },
    });

    if (users.length === 0) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const user = users[0];

    // Check if account is active
    if (!user.active) {
      return res.status(401).json({ message: 'Account is disabled' });
    }

    // Compare passwords
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Update last login
    await userDatabase.table('Users').update([
      { userId: user.userId, lastLogin: spanner.timestamp() }
    ]);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Publish login event
    const topic = pubsub.topic('user-events');
    const data = JSON.stringify({
      event: 'user-login',
      userId: user.userId,
      timestamp: new Date().toISOString(),
    });
    await topic.publish(Buffer.from(data));

    res.status(200).json({
      message: 'Authentication successful',
      token,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get user profile
app.get('/users/profile', authenticate, async (req, res) => {
  try {
    const [user] = await userDatabase.table('Users').read({
      columns: ['userId', 'name', 'email', 'role', 'phone', 'createdAt', 'lastLogin', 'active'],
      keys: [req.userData.userId],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
app.put('/users/profile', authenticate, async (req, res) => {
  try {
    const updateData = {
      userId: req.userData.userId,
    };

    // Only update the fields that are provided
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.phone) updateData.phone = req.body.phone;
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    await userDatabase.table('Users').update([updateData]);

    // Get updated user data
    const [user] = await userDatabase.table('Users').read({
      columns: ['userId', 'name', 'email', 'role', 'phone', 'createdAt', 'lastLogin', 'active'],
      keys: [req.userData.userId],
    });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Admin endpoints
// Get all users
app.get('/users', authenticate, authorizeRole(['admin']), async (req, res) => {
  try {
    const query = {
      sql: 'SELECT userId, name, email, role, phone, createdAt, lastLogin, active FROM Users',
    };

    const [users] = await userDatabase.run(query);

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update user role or status (admin only)
app.put('/users/:id', authenticate, authorizeRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const [user] = await userDatabase.table('Users').read({
      columns: ['userId'],
      keys: [userId],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {
      userId,
    };

    // Only allow updating role and active status
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.active !== undefined) updateData.active = req.body.active;

    await userDatabase.table('Users').update([updateData]);

    // Get updated user data
    const [updatedUser] = await userDatabase.table('Users').read({
      columns: ['userId', 'name', 'email', 'role', 'phone', 'createdAt', 'lastLogin', 'active'],
      keys: [userId],
    });

    // Publish user update event
    const topic = pubsub.topic('user-events');
    const data = JSON.stringify({
      event: 'user-updated',
      userId,
      updatedBy: req.userData.userId,
      timestamp: new Date().toISOString(),
    });
    await topic.publish(Buffer.from(data));

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`User management service running on port ${PORT}`);
});

module.exports = app;