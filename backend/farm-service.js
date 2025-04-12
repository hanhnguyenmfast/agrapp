// farm-service.js
const express = require('express');
const { Spanner } = require('@google-cloud/spanner');
const { Storage } = require('@google-cloud/storage');
const { PubSub } = require('@google-cloud/pubsub');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Google Cloud services
const spanner = new Spanner({
  projectId: 'your-project-id',
});
const instance = spanner.instance('agriculture-instance');
const farmDatabase = instance.database('farm-database');
const storage = new Storage();
const bucket = storage.bucket('farm-images');
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

// FARM ENDPOINTS

// Get all farms
app.get('/farms', authenticate, async (req, res) => {
  try {
    const query = {
      sql: 'SELECT * FROM Farms',
    };
    if (req.userData.role === 'farmer') {
      query.sql += ' WHERE ownerId = @ownerId';
      query.params = { ownerId: req.userData.userId };
    }

    const [rows] = await farmDatabase.table('Farms').run(query);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ message: 'Error fetching farms', error: error.message });
  }
});

// Get single farm
app.get('/farms/:id', authenticate, async (req, res) => {
  try {
    const [farm] = await farmDatabase.table('Farms').read({
      columns: ['farmId', 'name', 'location', 'size', 'cropTypes', 'lastUpdated', 'ownerId'],
      keys: [req.params.id],
    });

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check if user has access to this farm
    if (req.userData.role === 'farmer' && farm.ownerId !== req.userData.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(farm);
  } catch (error) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ message: 'Error fetching farm', error: error.message });
  }
});

// Create farm
app.post('/farms', authenticate, authorizeRole(['farmer', 'admin']), async (req, res) => {
  try {
    const farm = {
      farmId: spanner.datastore.uuid(),
      name: req.body.name,
      location: req.body.location,
      size: req.body.size,
      cropTypes: req.body.cropTypes,
      lastUpdated: spanner.timestamp(),
      ownerId: req.userData.userId,
    };

    await farmDatabase.table('Farms').insert([farm]);

    // Publish event for new farm creation
    const topic = pubsub.topic('farm-events');
    const data = JSON.stringify({
      event: 'farm-created',
      farmId: farm.farmId,
      timestamp: new Date().toISOString(),
      user: req.userData.userId
    });
    await topic.publish(Buffer.from(data));

    res.status(201).json(farm);
  } catch (error) {
    console.error('Error creating farm:', error);
    res.status(500).json({ message: 'Error creating farm', error: error.message });
  }
});

// Update farm
app.put('/farms/:id', authenticate, async (req, res) => {
  try {
    // First check if user has access to this farm
    const [farm] = await farmDatabase.table('Farms').read({
      columns: ['farmId', 'ownerId'],
      keys: [req.params.id],
    });

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    if (req.userData.role === 'farmer' && farm.ownerId !== req.userData.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {
      name: req.body.name,
      location: req.body.location,
      size: req.body.size,
      cropTypes: req.body.cropTypes,
      lastUpdated: spanner.timestamp(),
    };

    await farmDatabase.table('Farms').update([
      { farmId: req.params.id, ...updateData }
    ]);

    // Publish update event
    const topic = pubsub.topic('farm-events');
    const data = JSON.stringify({
      event: 'farm-updated',
      farmId: req.params.id,
      timestamp: new Date().toISOString(),
      user: req.userData.userId
    });
    await topic.publish(Buffer.from(data));

    res.status(200).json({ ...farm, ...updateData });
  } catch (error) {
    console.error('Error updating farm:', error);
    res.status(500).json({ message: 'Error updating farm', error: error.message });
  }
});

// Delete farm
app.delete('/farms/:id', authenticate, authorizeRole(['farmer', 'admin']), async (req, res) => {
  try {
    // First check if user has access to this farm
    const [farm] = await farmDatabase.table('Farms').read({
      columns: ['farmId', 'ownerId'],
      keys: [req.params.id],
    });

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    if (req.userData.role === 'farmer' && farm.ownerId !== req.userData.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await farmDatabase.table('Farms').delete([req.params.id]);

    // Publish delete event
    const topic = pubsub.topic('farm-events');
    const data = JSON.stringify({
      event: 'farm-deleted',
      farmId: req.params.id,
      timestamp: new Date().toISOString(),
      user: req.userData.userId
    });
    await topic.publish(Buffer.from(data));

    res.status(200).json({ message: 'Farm deleted successfully' });
  } catch (error) {
    console.error('Error deleting farm:', error);
    res.status(500).json({ message: 'Error deleting farm', error: error.message });
  }
});

// DAILY CHECK ENDPOINTS

// Get daily checks for a farm
app.get('/farms/:id/checks', authenticate, async (req, res) => {
  try {
    // First check if user has access to this farm
    const [farm] = await farmDatabase.table('Farms').read({
      columns: ['farmId', 'ownerId'],
      keys: [req.params.id],
    });

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    if (req.userData.role === 'farmer' && farm.ownerId !== req.userData.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = {
      sql: 'SELECT * FROM DailyChecks WHERE farmId = @farmId ORDER BY checkDate DESC',
      params: { farmId: req.params.id },
    };

    // Add date filter if provided
    if (req.query.date) {
      query.sql += ' AND checkDate = @checkDate';
      query.params.checkDate = req.query.date;
    }

    // Add limit if provided
    if (req.query.limit) {
      query.sql += ' LIMIT @limit';
      query.params.limit = parseInt(req.query.limit);
    }

    const [checks] = await farmDatabase.run(query);

    res.status(200).json(checks);
  } catch (error) {
    console.error('Error fetching daily checks:', error);
    res.status(500).json({ message: 'Error fetching daily checks', error: error.message });
  }
});

// Create daily check
app.post('/farms/:id/checks', authenticate, authorizeRole(['farmer']), async (req, res) => {
  try {
    // First check if user has access to this farm
    const [farm] = await farmDatabase.table('Farms').read({
      columns: ['farmId', 'ownerId'],
      keys: [req.params.id],
    });

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    if (farm.ownerId !== req.userData.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const check = {
      checkId: spanner.datastore.uuid(),
      farmId: req.params.id,
      checkDate: spanner.timestamp(),
      weather: req.body.weather,
      temperature: req.body.temperature,
      humidity: req.body.humidity,
      soilCondition: req.body.soilCondition,
      cropStatus: req.body.cropStatus,
      notes: req.body.notes,
      createdBy: req.userData.userId,
    };

    await farmDatabase.table('DailyChecks').insert([check]);

    // Upload any attached images
    if (req.body.images && req.body.images.length > 0) {
      const imagePromises = req.body.images.map(async (imageData, index) => {
        const buffer = Buffer.from(imageData.base64, 'base64');
        const filename = `farm_${req.params.id}/check_${check.checkId}/image_${index}.jpg`;
        const file = bucket.file(filename);

        await file.save(buffer, {
          metadata: {
            contentType: 'image/jpeg',
          },
        });

        return {
          imageId: spanner.datastore.uuid(),
          checkId: check.checkId,
          url: `https://storage.googleapis.com/${bucket.name}/${filename}`,
          uploadedAt: spanner.timestamp(),
        };
      });

      const images = await Promise.all(imagePromises);
      await farmDatabase.table('CheckImages').insert(images);
    }

    // Publish event for daily check creation
    const topic = pubsub.topic('farm-events');
    const data = JSON.stringify({
      event: 'daily-check-created',
      farmId: req.params.id,
      checkId: check.checkId,
      timestamp: new Date().toISOString(),
      user: req.userData.userId
    });
    await topic.publish(Buffer.from(data));

    res.status(201).json(check);
  } catch (error) {
    console.error('Error creating daily check:', error);
    res.status(500).json({ message: 'Error creating daily check', error: error.message });
  }
});

// Get analytics for a farm
app.get('/farms/:id/analytics', authenticate, async (req, res) => {
  try {
    // First check if user has access to this farm
    const [farm] = await farmDatabase.table('Farms').read({
      columns: ['farmId', 'ownerId'],
      keys: [req.params.id],
    });

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    if (req.userData.role === 'farmer' && farm.ownerId !== req.userData.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get temperature trends
    const tempQuery = {
      sql: `SELECT
              DATE(checkDate) as date,
              AVG(temperature) as avgTemperature
            FROM DailyChecks
            WHERE farmId = @farmId
            GROUP BY date
            ORDER BY date DESC
            LIMIT 30`,
      params: { farmId: req.params.id },
    };

    const [tempData] = await farmDatabase.run(tempQuery);

    // Get crop status trends
    const cropQuery = {
      sql: `SELECT
              checkDate,
              cropStatus
            FROM DailyChecks
            WHERE farmId = @farmId
            ORDER BY checkDate DESC
            LIMIT 30`,
      params: { farmId: req.params.id },
    };

    const [cropData] = await farmDatabase.run(cropQuery);

    // Get activity trends
    const activityQuery = {
      sql: `SELECT
              DATE(checkDate) as date,
              COUNT(*) as checkCount
            FROM DailyChecks
            WHERE farmId = @farmId
            GROUP BY date
            ORDER BY date DESC
            LIMIT 30`,
      params: { farmId: req.params.id },
    };

    const [activityData] = await farmDatabase.run(activityQuery);

    res.status(200).json({
      temperatureTrends: tempData,
      cropStatusTrends: cropData,
      activityTrends: activityData
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Farm management service running on port ${PORT}`);
});

module.exports = app;