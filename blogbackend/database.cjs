const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Jesus@1989',
    database: 'new_schema'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
});

module.exports = connection;
