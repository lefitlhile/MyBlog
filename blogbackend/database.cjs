const mysql = require('mysql2');
const db = mysql.createConnection

// Create the connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Jesus@1989',
    database: 'new_database'
});

// Connect to the database
connection.connect(err => {
    if (err) throw err;
    console.log('MySQL database is Connected.');
});

// Function to add a post
const addPost = (title, content, callback) => {
    const query = 'INSERT INTO posts (title, content) VALUES (?, ?)';
    connection.query(query, [title, content], (err, results) => {
        callback(err, results);
    });
};

// Function to update a post
const updatePost = (id, title, content, callback) => {
    const query = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
    connection.query(query, [title, content, id], (err, results) => {
        callback(err, results);
    });
};

// Function to delete a post
const deletePost = (id, callback) => {
    const query = 'DELETE FROM posts WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        callback(err, results);
    });
};

// Export the connection and functions
module.exports = {
    connection,
    addPost,
    updatePost,
    deletePost
};
