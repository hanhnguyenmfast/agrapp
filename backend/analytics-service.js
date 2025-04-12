// analytics-service.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'farm_db',
  host: process.env.DB_HOST || '127.0.0.1',
  port: 5432,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});

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

// Role-based access control
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userData.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Farm Analytics
app.get('/analytics/farms/:id', authenticate, async (req, res) => {
  try {
    const farmId = req.params.id;

    // Check if the user has access to this farm
    let hasAccess = false;

    if (req.userData.role === 'admin') {
      hasAccess = true;
    } else if (req.userData.role === 'farmer') {
      // Check if the farm belongs to this farmer
      const farmResult = await pool.query(
        'SELECT farm_id FROM farms WHERE farm_id = $1 AND owner_id = $2',
        [farmId, req.userData.userId]
      );

      hasAccess = farmResult.rows.length > 0;
    } else if (req.userData.role === 'investor') {
      // Check if the user is an investor for this farm
      const investmentResult = await pool.query(
        'SELECT farm_id FROM farm_investors WHERE farm_id = $1 AND user_id = $2',
        [farmId, req.userData.userId]
      );

      hasAccess = investmentResult.rows.length > 0;
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get basic farm info
    const farmResult = await pool.query(
      'SELECT farm_id, name, location, size, crop_types, last_updated FROM farms WHERE farm_id = $1',
      [farmId]
    );

    if (farmResult.rows.length === 0) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    const farm = farmResult.rows[0];

    // Get daily check summary
    const checksSummaryResult = await pool.query(
      `SELECT
        COUNT(*) as total_checks,
        MAX(check_date) as last_check_date,
        AVG(temperature) as avg_temperature,
        AVG(humidity) as avg_humidity
      FROM daily_checks
      WHERE farm_id = $1`,
      [farmId]
    );

    // Get monthly temperature trends
    const tempTrendsResult = await pool.query(
      `SELECT
        EXTRACT(MONTH FROM check_date) as month,
        EXTRACT(YEAR FROM check_date) as year,
        AVG(temperature) as avg_temperature,
        MAX(temperature) as max_temperature,
        MIN(temperature) as min_temperature
      FROM daily_checks
      WHERE farm_id = $1
      GROUP BY year, month
      ORDER BY year, month
      LIMIT 12`,
      [farmId]
    );

    // Get crop status trends
    const cropStatusTrendsResult = await pool.query(
      `SELECT
        crop_status,
        COUNT(*) as count
      FROM daily_checks
      WHERE farm_id = $1
      GROUP BY crop_status
      ORDER BY count DESC`,
      [farmId]
    );

    // Get recent activities
    const recentActivitiesResult = await pool.query(
      `SELECT
        'daily-check' as type,
        check_id as id,
        check_date as timestamp,
        CONCAT('Daily check performed') as description
      FROM daily_checks
      WHERE farm_id = $1
      ORDER BY check_date DESC
      LIMIT 10`,
      [farmId]
    );

    res.status(200).json({
      farm,
      checksSummary: checksSummaryResult.rows[0] || {},
      tempTrends: tempTrendsResult.rows,
      cropStatusTrends: cropStatusTrendsResult.rows,
      recentActivities: recentActivitiesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching farm analytics:', error);
    res.status(500).json({ message: 'Error fetching farm analytics', error: error.message });
  }
});

// Global Analytics - Admin only
app.get('/analytics/global', authenticate, authorizeRole(['admin']), async (req, res) => {
  try {
    // Get farm count
    const farmCountResult = await pool.query('SELECT COUNT(*) as count FROM farms');

    // Get user count by role
    const userCountResult = await pool.query(
      `SELECT
        role,
        COUNT(*) as count
      FROM users
      GROUP BY role`
    );

    // Get daily check count
    const checkCountResult = await pool.query('SELECT COUNT(*) as count FROM daily_checks');

    // Get activity by month
    const monthlyActivityResult = await pool.query(
      `SELECT
        EXTRACT(MONTH FROM check_date) as month,
        EXTRACT(YEAR FROM check_date) as year,
        COUNT(*) as check_count
      FROM daily_checks
      GROUP BY year, month
      ORDER BY year, month
      LIMIT 12`
    );

    // Get top active farms
    const topFarmsResult = await pool.query(
      `SELECT
        d.farm_id,
        f.name as farm_name,
        COUNT(*) as check_count
      FROM daily_checks d
      JOIN farms f ON d.farm_id = f.farm_id
      GROUP BY d.farm_id, f.name
      ORDER BY check_count DESC
      LIMIT 5`
    );

    res.status(200).json({
      farmCount: farmCountResult.rows[0] || { count: 0 },
      userCount: userCountResult.rows,
      checkCount: checkCountResult.rows[0] || { count: 0 },
      monthlyActivity: monthlyActivityResult.rows,
      topFarms: topFarmsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching global analytics:', error);
    res.status(500).json({ message: 'Error fetching global analytics', error: error.message });
  }
});

// Crop Analytics
app.get('/analytics/crops', authenticate, async (req, res) => {
  try {
    let query, params = [];

    if (req.userData.role === 'farmer') {
      query = `
        SELECT
          UNNEST(crop_types) as crop,
          COUNT(*) as farm_count
        FROM farms
        WHERE owner_id = $1
        GROUP BY crop
        ORDER BY farm_count DESC
      `;
      params.push(req.userData.userId);
    } else {
      query = `
        SELECT
          UNNEST(crop_types) as crop,
          COUNT(*) as farm_count
        FROM farms
        GROUP BY crop
        ORDER BY farm_count DESC
      `;
    }

    const cropStatsResult = await pool.query(query, params);

    // Get crop performance data (based on crop status from daily checks)
    let performanceQuery;
    let performanceParams = [];

    if (req.userData.role === 'farmer') {
      performanceQuery = `
        SELECT
          f.farm_id,
          UNNEST(f.crop_types) as crop,
          d.crop_status,
          COUNT(*) as status_count
        FROM farms f
        JOIN daily_checks d ON f.farm_id = d.farm_id
        WHERE f.owner_id = $1
        GROUP BY f.farm_id, crop, d.crop_status
        ORDER BY status_count DESC
      `;
      performanceParams.push(req.userData.userId);
    } else {
      performanceQuery = `
        SELECT
          f.farm_id,
          UNNEST(f.crop_types) as crop,
          d.crop_status,
          COUNT(*) as status_count
        FROM farms f
        JOIN daily_checks d ON f.farm_id = d.farm_id
        GROUP BY f.farm_id, crop, d.crop_status
        ORDER BY status_count DESC
      `;
    }

    const cropPerformanceResult = await pool.query(performanceQuery, performanceParams);

    // Process crop performance data
    const cropPerformanceByType = {};

    cropPerformanceResult.rows.forEach((record) => {
      if (!cropPerformanceByType[record.crop]) {
        cropPerformanceByType[record.crop] = {
          crop: record.crop,
          excellent: 0,
          good: 0,
          fair: 0,
          poor: 0,
        };
      }

      const status = record.crop_status.toLowerCase();
      if (status.includes('excellent')) {
        cropPerformanceByType[record.crop].excellent += parseInt(record.status_count);
      } else if (status.includes('good')) {
        cropPerformanceByType[record.crop].good += parseInt(record.status_count);
      } else if (status.includes('fair')) {
        cropPerformanceByType[record.crop].fair += parseInt(record.status_count);
      } else if (status.includes('poor')) {
        cropPerformanceByType[record.crop].poor += parseInt(record.status_count);
      }
    });

    res.status(200).json({
      cropStats: cropStatsResult.rows,
      cropPerformance: Object.values(cropPerformanceByType),
    });
  } catch (error) {
    console.error('Error fetching crop analytics:', error);
    res.status(500).json({ message: 'Error fetching crop analytics', error: error.message });
  }
});

// Investor Analytics
app.get('/analytics/investments', authenticate, async (req, res) => {
  try {
    if (req.userData.role !== 'investor' && req.userData.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query, params = [];

    if (req.userData.role === 'investor') {
      // Get analytics for farms this investor has invested in
      query = `
        SELECT
          f.farm_id,
          f.name,
          f.size,
          f.location,
          f.crop_types,
          i.investment_amount,
          i.investment_date,
          (SELECT COUNT(*) FROM daily_checks d WHERE d.farm_id = f.farm_id) as check_count,
          (SELECT MAX(check_date) FROM daily_checks d WHERE d.farm_id = f.farm_id) as last_check_date
        FROM farms f
        JOIN farm_investors i ON f.farm_id = i.farm_id
        WHERE i.user_id = $1
      `;
      params.push(req.userData.userId);
    } else {
      // Admin can see all investments
      query = `
        SELECT
          f.farm_id,
          f.name,
          u.name as investor_name,
          i.investment_amount,
          i.investment_date
        FROM farms f
        JOIN farm_investors i ON f.farm_id = i.farm_id
        JOIN users u ON i.user_id = u.user_id
        ORDER BY i.investment_date DESC
      `;
    }

    const investmentsResult = await pool.query(query, params);

    // If investor, get more detailed analytics
    if (req.userData.role === 'investor') {
      // Calculate total investment
      const totalInvestment = investmentsResult.rows.reduce(
        (total, farm) => total + parseFloat(farm.investment_amount), 0
      );

      // Get farm performance metrics if there are investments
      const farmIds = investmentsResult.rows.map(farm => farm.farm_id);

      if (farmIds.length > 0) {
        // Create placeholders for query
        const placeholders = farmIds.map((_, i) => `$${i + 1}`).join(', ');

        const performanceQuery = `
          SELECT
            farm_id,
            AVG(
              CASE
                WHEN crop_status LIKE '%Excellent%' THEN 4
                WHEN crop_status LIKE '%Good%' THEN 3
                WHEN crop_status LIKE '%Fair%' THEN 2
                WHEN crop_status LIKE '%Poor%' THEN 1
                ELSE 0
              END
            ) as performance_score
          FROM daily_checks
          WHERE farm_id IN (${placeholders})
          GROUP BY farm_id
        `;

        const performanceResult = await pool.query(performanceQuery, farmIds);

        // Merge performance data with investments
        investmentsResult.rows.forEach(farm => {
          const farmPerformance = performanceResult.rows.find(p => p.farm_id === farm.farm_id);
          farm.performance_score = farmPerformance ? parseFloat(farmPerformance.performance_score) : 0;
        });
      }

      return res.status(200).json({
        investments: investmentsResult.rows,
        totalInvestment,
        investmentCount: investmentsResult.rows.length,
      });
    }

    // Return all investments for admin
    res.status(200).json({
      investments: investmentsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching investment analytics:', error);
    res.status(500).json({ message: 'Error fetching investment analytics', error: error.message });
  }
});

// Custom reports
app.post('/analytics/reports', authenticate, async (req, res) => {
  try {
    // Validate user has access to the requested farms
    const farmIds = req.body.farmIds || [];

    if (farmIds.length > 0 && req.userData.role !== 'admin') {
      let hasAccess = true;

      if (req.userData.role === 'farmer') {
        // Check if all farms belong to this farmer
        const accessResult = await pool.query(
          `SELECT COUNT(farm_id) as count
           FROM farms
           WHERE farm_id = ANY($1::varchar[]) AND owner_id = $2`,
          [farmIds, req.userData.userId]
        );

        if (parseInt(accessResult.rows[0].count) !== farmIds.length) {
          hasAccess = false;
        }
      } else if (req.userData.role === 'investor') {
        // Check if the user is an investor for all these farms
        const accessResult = await pool.query(
          `SELECT COUNT(farm_id) as count
           FROM farm_investors
           WHERE farm_id = ANY($1::varchar[]) AND user_id = $2`,
          [farmIds, req.userData.userId]
        );

        if (parseInt(accessResult.rows[0].count) !== farmIds.length) {
          hasAccess = false;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to one or more farms' });
      }
    }

    // Build custom report query based on request parameters
    let query, queryParams = [];

    switch (req.body.reportType) {
      case 'farm_activity': {
        query = `
          SELECT
            f.farm_id,
            f.name,
            COUNT(d.check_id) as check_count,
            MAX(d.check_date) as last_check_date,
            MIN(d.check_date) as first_check_date
          FROM farms f
          LEFT JOIN daily_checks d ON f.farm_id = d.farm_id
        `;

        // Add filters based on role
        if (farmIds.length > 0) {
          query += ` WHERE f.farm_id = ANY($1::varchar[])`;
          queryParams.push(farmIds);
        } else if (req.userData.role === 'farmer') {
          query += ` WHERE f.owner_id = $1`;
          queryParams.push(req.userData.userId);
        } else if (req.userData.role === 'investor') {
          query += ` WHERE f.farm_id IN (SELECT farm_id FROM farm_investors WHERE user_id = $1)`;
          queryParams.push(req.userData.userId);
        }

        query += ` GROUP BY f.farm_id, f.name ORDER BY check_count DESC`;
        break;
      }

      case 'weather_impact': {
        query = `
          SELECT
            weather,
            AVG(temperature) as avg_temperature,
            AVG(humidity) as avg_humidity,
            COUNT(*) as check_count,
            COUNT(CASE WHEN crop_status LIKE '%Excellent%' THEN 1 END) as excellent_count,
            COUNT(CASE WHEN crop_status LIKE '%Good%' THEN 1 END) as good_count,
            COUNT(CASE WHEN crop_status LIKE '%Fair%' THEN 1 END) as fair_count,
            COUNT(CASE WHEN crop_status LIKE '%Poor%' THEN 1 END) as poor_count
          FROM daily_checks d
        `;

        // Add filters based on role
        if (farmIds.length > 0) {
          query += ` WHERE d.farm_id = ANY($1::varchar[])`;
          queryParams.push(farmIds);
        } else if (req.userData.role === 'farmer') {
          query += ` WHERE d.farm_id IN (SELECT farm_id FROM farms WHERE owner_id = $1)`;
          queryParams.push(req.userData.userId);
        } else if (req.userData.role === 'investor') {
          query += ` WHERE d.farm_id IN (SELECT farm_id FROM farm_investors WHERE user_id = $1)`;
          queryParams.push(req.userData.userId);
        }

        query += ` GROUP BY weather ORDER BY check_count DESC`;
        break;
      }

      case 'crop_performance': {
        query = `
          SELECT
            UNNEST(f.crop_types) as crop,
            AVG(
              CASE
                WHEN d.crop_status LIKE '%Excellent%' THEN 4
                WHEN d.crop_status LIKE '%Good%' THEN 3
                WHEN d.crop_status LIKE '%Fair%' THEN 2
                WHEN d.crop_status LIKE '%Poor%' THEN 1
                ELSE 0
              END
            ) as performance_score,
            COUNT(d.check_id) as check_count
          FROM farms f
          JOIN daily_checks d ON f.farm_id = d.farm_id
        `;

        // Add filters based on role
        if (farmIds.length > 0) {
          query += ` WHERE f.farm_id = ANY($1::varchar[])`;
          queryParams.push(farmIds);
        } else if (req.userData.role === 'farmer') {
          query += ` WHERE f.owner_id = $1`;
          queryParams.push(req.userData.userId);
        } else if (req.userData.role === 'investor') {
          query += ` WHERE f.farm_id IN (SELECT farm_id FROM farm_investors WHERE user_id = $1)`;
          queryParams.push(req.userData.userId);
        }

        query += ` GROUP BY crop ORDER BY performance_score DESC`;
        break;
      }

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Execute the query
    const results = await pool.query(query, queryParams);

    res.status(200).json({
      reportType: req.body.reportType,
      generatedAt: new Date().toISOString(),
      data: results.rows,
    });
  } catch (error) {
    console.error('Error generating custom report:', error);
    res.status(500).json({ message: 'Error generating custom report', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`);
});

module.exports = app;