// notification-service.js
const express = require('express');
const { Pool } = require('pg');
const { PubSub } = require('@google-cloud/pubsub');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'farm_db', // Uses farm_db for notifications
  host: process.env.DB_HOST || '127.0.0.1',
  port: 5432,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});

// For user data access
const userPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.USER_DB_NAME || 'user_db',
  host: process.env.DB_HOST || '127.0.0.1',
  port: 5432,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});

// Initialize Google Cloud services
const pubsub = new PubSub();

// Initialize email transport
const emailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Initialize Twilio for SMS
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ?
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

// Process farm events subscription
let farmEventSubscription;
try {
  farmEventSubscription = pubsub
    .subscription('farm-events-subscription')
    .on('message', async (message) => {
      try {
        const event = JSON.parse(message.data.toString());
        console.log(`Received farm event: ${event.event}`);

        // Process the event based on its type
        switch (event.event) {
          case 'farm-created':
            await handleFarmCreated(event);
            break;
          case 'farm-updated':
            await handleFarmUpdated(event);
            break;
          case 'daily-check-created':
            await handleDailyCheckCreated(event);
            break;
          // Add more event types as needed
        }

        // Acknowledge the message
        message.ack();
      } catch (error) {
        console.error('Error processing farm event:', error);
        // Don't acknowledge, allowing for retry
      }
    });
} catch (error) {
  console.error('Error setting up farm event subscription:', error);
}

// Process user events subscription
let userEventSubscription;
try {
  userEventSubscription = pubsub
    .subscription('user-events-subscription')
    .on('message', async (message) => {
      try {
        const event = JSON.parse(message.data.toString());
        console.log(`Received user event: ${event.event}`);

        // Process the event based on its type
        switch (event.event) {
          case 'user-created':
            await handleUserCreated(event);
            break;
          case 'user-login':
            // You might want to log this but not send notifications
            break;
          // Add more event types as needed
        }

        // Acknowledge the message
        message.ack();
      } catch (error) {
        console.error('Error processing user event:', error);
        // Don't acknowledge, allowing for retry
      }
    });
} catch (error) {
  console.error('Error setting up user event subscription:', error);
}

// Event handlers
async function handleFarmCreated(event) {
  try {
    // Get farm details
    const farmResult = await pool.query(
      'SELECT farm_id, name, owner_id FROM farms WHERE farm_id = $1',
      [event.farmId]
    );

    if (farmResult.rows.length === 0) {
      throw new Error('Farm not found');
    }

    const farm = farmResult.rows[0];

    // Get farm owner details
    const ownerResult = await userPool.query(
      'SELECT user_id, name, email, phone FROM users WHERE user_id = $1',
      [farm.owner_id]
    );

    if (ownerResult.rows.length === 0) {
      throw new Error('Farm owner not found');
    }

    const owner = ownerResult.rows[0];

    // Get all admin users for notification
    const adminsResult = await userPool.query(
      'SELECT user_id, name, email FROM users WHERE role = $1',
      ['admin']
    );

    // Send email notification to the farm owner
    await sendEmail(
      owner.email,
      'Farm Created Successfully',
      `Dear ${owner.name},\n\nYour farm "${farm.name}" has been created successfully.\n\nRegards,\nAgriculture App Team`
    );

    // Send SMS confirmation to the owner if phone number exists
    if (owner.phone) {
      await sendSMS(
        owner.phone,
        `Your farm "${farm.name}" has been created successfully.`
      );
    }

    // Notify all admins
    for (const admin of adminsResult.rows) {
      await sendEmail(
        admin.email,
        'New Farm Created',
        `Dear ${admin.name},\n\nA new farm "${farm.name}" has been created by ${owner.name}.\n\nRegards,\nAgriculture App Team`
      );
    }

    // Store the notification in the database
    await storeNotification({
      type: 'FARM_CREATED',
      farm_id: farm.farm_id,
      user_id: farm.owner_id,
      message: `Farm "${farm.name}" created successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error handling farm created event:', error);
  }
}

async function handleFarmUpdated(event) {
  try {
    // Get farm details
    const farmResult = await pool.query(
      'SELECT farm_id, name, owner_id FROM farms WHERE farm_id = $1',
      [event.farmId]
    );

    if (farmResult.rows.length === 0) {
      throw new Error('Farm not found');
    }

    const farm = farmResult.rows[0];

    // Get farm owner details
    const ownerResult = await userPool.query(
      'SELECT user_id, name, email, phone FROM users WHERE user_id = $1',
      [farm.owner_id]
    );

    if (ownerResult.rows.length === 0) {
      throw new Error('Farm owner not found');
    }

    const owner = ownerResult.rows[0];

    // Get all investors for this farm
    const investorsResult = await pool.query(
      `SELECT i.user_id, u.name, u.email
       FROM farm_investors i
       JOIN users u ON i.user_id = u.user_id
       WHERE i.farm_id = $1`,
      [farm.farm_id]
    );

    // Send email notification to the farm owner
    await sendEmail(
      owner.email,
      'Farm Updated Successfully',
      `Dear ${owner.name},\n\nYour farm "${farm.name}" has been updated successfully.\n\nRegards,\nAgriculture App Team`
    );

    // Notify all investors
    for (const investor of investorsResult.rows) {
      await sendEmail(
        investor.email,
        'Farm Updated',
        `Dear ${investor.name},\n\nThe farm "${farm.name}" you've invested in has been updated.\n\nRegards,\nAgriculture App Team`
      );
    }

    // Store the notification in the database
    await storeNotification({
      type: 'FARM_UPDATED',
      farm_id: farm.farm_id,
      user_id: farm.owner_id,
      message: `Farm "${farm.name}" updated successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error handling farm updated event:', error);
  }
}

async function handleDailyCheckCreated(event) {
  try {
    // Get check details
    const checkResult = await pool.query(
      'SELECT check_id, farm_id, check_date, crop_status, notes FROM daily_checks WHERE check_id = $1',
      [event.checkId]
    );

    if (checkResult.rows.length === 0) {
      throw new Error('Daily check not found');
    }

    const check = checkResult.rows[0];

    // Get farm details
    const farmResult = await pool.query(
      'SELECT farm_id, name, owner_id FROM farms WHERE farm_id = $1',
      [check.farm_id]
    );

    if (farmResult.rows.length === 0) {
      throw new Error('Farm not found');
    }

    const farm = farmResult.rows[0];

    // Get all investors for this farm
    const investorsResult = await pool.query(
      `SELECT i.user_id, u.name, u.email
       FROM farm_investors i
       JOIN users u ON i.user_id = u.user_id
       WHERE i.farm_id = $1`,
      [farm.farm_id]
    );

    // Format check date
    const checkDate = new Date(check.check_date).toLocaleDateString();

    // Notify all investors
    for (const investor of investorsResult.rows) {
      await sendEmail(
        investor.email,
        `New Daily Check for ${farm.name}`,
        `Dear ${investor.name},\n\nA new daily check has been recorded for the farm "${farm.name}" on ${checkDate}.\n\nCrop Status: ${check.crop_status}\nNotes: ${check.notes || 'None'}\n\nRegards,\nAgriculture App Team`
      );
    }

    // Store the notification in the database
    await storeNotification({
      type: 'DAILY_CHECK_CREATED',
      farm_id: farm.farm_id,
      check_id: check.check_id,
      user_id: farm.owner_id,
      message: `New daily check recorded for farm "${farm.name}"`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error handling daily check created event:', error);
  }
}

async function handleUserCreated(event) {
  try {
    // Get user details
    const userResult = await userPool.query(
      'SELECT user_id, name, email, role FROM users WHERE user_id = $1',
      [event.userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // Send welcome email to the new user
    await sendEmail(
      user.email,
      'Welcome to Agriculture App',
      `Dear ${user.name},\n\nWelcome to Agriculture App! Your account has been created successfully.\n\nRegards,\nAgriculture App Team`
    );

    // If the new user is a farmer, notify admins
    if (user.role === 'farmer') {
      // Get all admin users for notification
      const adminsResult = await userPool.query(
        'SELECT user_id, name, email FROM users WHERE role = $1',
        ['admin']
      );

      // Notify all admins
      for (const admin of adminsResult.rows) {
        await sendEmail(
          admin.email,
          'New Farmer Registered',
          `Dear ${admin.name},\n\nA new farmer "${user.name}" has registered on the platform.\n\nRegards,\nAgriculture App Team`
        );
      }
    }

    // Store the notification in the database
    await storeNotification({
      type: 'USER_CREATED',
      user_id: user.user_id,
      message: `User "${user.name}" created successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error handling user created event:', error);
  }
}

// Helper functions
async function sendEmail(to, subject, text) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Text: ${text.substring(0, 50)}...`);
      return;
    }

    await emailTransport.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

async function sendSMS(to, message) {
  try {
    if (!twilioClient) {
      console.log(`[MOCK SMS] To: ${to}, Message: ${message.substring(0, 30)}...`);
      return;
    }

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`SMS sent to ${to}: ${message.substring(0, 30)}...`);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

async function storeNotification(notification) {
  try {
    const notificationId = uuidv4();

    await pool.query(
      `INSERT INTO notifications(
        notification_id, type, farm_id, check_id, user_id, message, timestamp, read
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        notificationId,
        notification.type,
        notification.farm_id || null,
        notification.check_id || null,
        notification.user_id,
        notification.message,
        notification.timestamp,
        false
      ]
    );
  } catch (error) {
    console.error('Error storing notification:', error);
    throw error;
  }
}

// Auth middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Get user notification settings
app.get('/notifications/settings', authenticate, async (req, res) => {
  try {
    const result = await userPool.query(
      'SELECT user_id, email_enabled, sms_enabled, event_types FROM notification_settings WHERE user_id = $1',
      [req.userData.userId]
    );

    if (result.rows.length === 0) {
      // Create default settings if not exist
      const defaultSettings = {
        user_id: req.userData.userId,
        email_enabled: true,
        sms_enabled: true,
        event_types: ['FARM_CREATED', 'FARM_UPDATED', 'DAILY_CHECK_CREATED'],
      };

      await userPool.query(
        `INSERT INTO notification_settings(user_id, email_enabled, sms_enabled, event_types)
         VALUES($1, $2, $3, $4)`,
        [
          defaultSettings.user_id,
          defaultSettings.email_enabled,
          defaultSettings.sms_enabled,
          defaultSettings.event_types
        ]
      );

      return res.status(200).json(defaultSettings);
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ message: 'Error fetching notification settings', error: error.message });
  }
});

// Update user notification settings
app.put('/notifications/settings', authenticate, async (req, res) => {
  try {
    let updateQuery = 'UPDATE notification_settings SET ';
    const updateValues = [];
    const updateFields = [];

    if (req.body.email_enabled !== undefined) {
      updateFields.push(`email_enabled = ${updateValues.length + 1}`);
      updateValues.push(req.body.email_enabled);
    }

    if (req.body.sms_enabled !== undefined) {
      updateFields.push(`sms_enabled = ${updateValues.length + 1}`);
      updateValues.push(req.body.sms_enabled);
    }

    if (req.body.event_types) {
      updateFields.push(`event_types = ${updateValues.length + 1}`);
      updateValues.push(req.body.event_types);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateQuery += updateFields.join(', ');
    updateQuery += ` WHERE user_id = ${updateValues.length + 1} RETURNING *`;
    updateValues.push(req.userData.userId);

    const result = await userPool.query(updateQuery, updateValues);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Error updating notification settings', error: error.message });
  }
});

// Get user notifications
app.get('/notifications', authenticate, async (req, res) => {
  try {
    let query = 'SELECT * FROM notifications WHERE user_id = $1 ORDER BY timestamp DESC';
    const params = [req.userData.userId];

    // Add limit if provided
    if (req.query.limit) {
      query += ' LIMIT $2';
      params.push(parseInt(req.query.limit));
    }

    const result = await pool.query(query, params);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Mark notification as read
app.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Check if notification belongs to user
    const notificationResult = await pool.query(
      'SELECT notification_id, user_id FROM notifications WHERE notification_id = $1',
      [notificationId]
    );

    if (notificationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const notification = notificationResult.rows[0];

    if (notification.user_id !== req.userData.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await pool.query(
      'UPDATE notifications SET read = true WHERE notification_id = $1',
      [notificationId]
    );

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

// Start the API server
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Notification service API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down notification service');
  if (farmEventSubscription) {
    farmEventSubscription.close();
  }
  if (userEventSubscription) {
    userEventSubscription.close();
  }
});

module.exports = app;