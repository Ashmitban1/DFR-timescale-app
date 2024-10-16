from flask import Flask, jsonify, request
import psycopg2

app = Flask(__name__)

# Database configuration
DB_CONFIG = {
    "dbname": "tsdb",
    "user": "tsdbadmin",
    "password": "q7avqexp3k8wd11h",
    "host": "xacki8qsqp.dohwi1utql.tsdb.cloud.timescale.com",
    "port": 36107,
    "sslmode": "require"
}

# Function to establish database connection
def get_db_connection():
    conn = psycopg2.connect(**DB_CONFIG)
    return conn

@app.route('/sensors', methods=['GET'])
def get_sensors():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM sensors;')
    sensors = cur.fetchall()
    cur.close()
    conn.close()

    sensor_list = []
    for sensor in sensors:
        sensor_dict = {
            'sensor_id': sensor[0],
            'car': sensor[1],
            'group': sensor[2],
            'type': sensor[3],
            'name': sensor[4]
        }
        sensor_list.append(sensor_dict)
    
    return jsonify(sensor_list)

@app.route('/sensors', methods=['POST'])
def add_sensor():
    new_sensor = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        'INSERT INTO sensors (car, "group", "type", name) VALUES (%s, %s, %s, %s);',
        (new_sensor['car'], new_sensor['group'], new_sensor['type'], new_sensor['name'])
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'Sensor added successfully!'}), 201

@app.route('/sensors/<int:sensor_id>', methods=['PUT'])
def update_sensor(sensor_id):
    updated_sensor = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        'UPDATE sensors SET car = %s, "group" = %s, "type" = %s, name = %s WHERE sensor_id = %s;',
        (updated_sensor['car'], updated_sensor['group'], updated_sensor['type'], updated_sensor['name'], sensor_id)
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'Sensor updated successfully!'})

@app.route('/sensors/<int:sensor_id>', methods=['DELETE'])
def delete_sensor(sensor_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('DELETE FROM sensors WHERE sensor_id = %s;', (sensor_id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'Sensor deleted successfully!'})

if __name__ == '__main__':
    app.run(debug=True)
