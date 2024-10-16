const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // pg library for PostgreSQL

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (Updated to use the TimescaleDB instance)
const pool = new Pool({
  user: 'tsdbadmin',
  host: 'xacki8qsqp.dohwi1utql.tsdb.cloud.timescale.com',
  database: 'tsdb',
  password: 'q7avqexp3k8wd11h',
  port: 36107,
  ssl: {
    rejectUnauthorized: false,  // To avoid SSL issues with remote databases
  },
});

// Get all sensors
app.get('/sensors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sensors');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sensors:', err.stack);
    res.status(500).json({ error: 'Error fetching sensors' });
  }
});

// Add a sensor
app.post('/sensors', async (req, res) => {
  try {
    const { car, group, type, name } = req.body;
    if (!car || !group || !type || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const newSensor = await pool.query(
      'INSERT INTO sensors (car, "group", type, name) VALUES ($1, $2, $3, $4) RETURNING *',
      [car, group, type, name]
    );
    res.status(201).json(newSensor.rows[0]);
  } catch (err) {
    console.error('Error adding sensor:', err.stack);
    res.status(500).json({ error: 'Error adding sensor' });
  }
});

// Update a sensor
app.put('/sensors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { car, group, type, name } = req.body;
    if (!car || !group || !type || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const updatedSensor = await pool.query(
      'UPDATE sensors SET car = $1, "group" = $2, type = $3, name = $4 WHERE sensor_id = $5 RETURNING *',
      [car, group, type, name, id]
    );
    res.json(updatedSensor.rows[0]);
  } catch (err) {
    console.error('Error updating sensor:', err.stack);
    res.status(500).json({ error: 'Error updating sensor' });
  }
});

// Delete a sensor
app.delete('/sensors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sensors WHERE sensor_id = $1', [id]);
    res.json({ message: 'Sensor deleted' });
  } catch (err) {
    console.error('Error deleting sensor:', err.stack);
    res.status(500).json({ error: 'Error deleting sensor' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
