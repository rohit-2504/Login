const mysql = require('mysql2');

const connection = mysql.createConnection({
          host: '192.168.170.105', // Replace with your phone's IP address
          user: 'rohit',   // MySQL username
          password: '2504', // MySQL password
          database: 'user', // Database name
          port: 3306 // MySQL port (default 3306)
        });
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
      return;
    }
    console.log('Connected to the database with ID:', connection.threadId);
  });