import React, { useState, useEffect } from 'react';

// Backend API URL
const API_URL = 'http://localhost:5000/sensors';

const App = () => {
  const [sensors, setSensors] = useState([]);
  const [newSensor, setNewSensor] = useState({ car: '', group: '', type: '', name: '' });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setSensors(data);
    } catch (err) {
      setError('Error fetching sensors');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSensor({ ...newSensor, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await updateSensor(editingId);
    } else {
      await addSensor();
    }
    setNewSensor({ car: '', group: '', type: '', name: '' });
  };

  const addSensor = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSensor),
      });
      const addedSensor = await response.json();
      setSensors([...sensors, addedSensor]);
    } catch (err) {
      setError('Error adding sensor');
    }
  };

  const editSensor = (sensor) => {
    setNewSensor(sensor);
    setIsEditing(true);
    setEditingId(sensor.sensor_id);
  };

  const updateSensor = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSensor),
      });
      const updatedSensor = await response.json();
      setSensors(
        sensors.map((sensor) => (sensor.sensor_id === id ? updatedSensor : sensor))
      );
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      setError('Error updating sensor');
    }
  };

  const deleteSensor = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      setSensors(sensors.filter((sensor) => sensor.sensor_id !== id));
    } catch (err) {
      setError('Error deleting sensor');
    }
  };

  return (
    <div>
      <h1>Sensor Data</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>{isEditing ? 'Edit Sensor' : 'Add New Sensor'}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="car"
          placeholder="Car"
          value={newSensor.car}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="group"
          placeholder="Group"
          value={newSensor.group}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="type"
          placeholder="Type"
          value={newSensor.type}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newSensor.name}
          onChange={handleInputChange}
          required
        />
        <button type="submit">{isEditing ? 'Update Sensor' : 'Add Sensor'}</button>
      </form>

      <h3>Sensors List</h3>
      <table>
        <thead>
          <tr>
            <th>Car</th>
            <th>Group</th>
            <th>Type</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sensors.length > 0 ? (
            sensors.map((sensor) => (
              <tr key={sensor.sensor_id}>
                <td>{sensor.car}</td>
                <td>{sensor.group}</td>
                <td>{sensor.type}</td>
                <td>{sensor.name}</td>
                <td>
                  <button onClick={() => editSensor(sensor)}>Edit</button>
                  <button onClick={() => deleteSensor(sensor.sensor_id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No sensors found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default App;
