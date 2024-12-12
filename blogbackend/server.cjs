const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path'); 
const app = express();
const PORT = process.env.PORT || 5000;

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',      
    user: 'root',            
    password: 'Jesus@1989',            
    database: 'personal_blog' 
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Get all posts
app.get('/api/posts', (req, res) => {
    db.query('SELECT * FROM posts', (err, results) => {
        if (err) {
            console.error('Error reading posts:', err);
            return res.status(500).send('Error reading posts');
        }
        res.status(200).json(results);
    });
});

// Create a new post
app.post('/api/posts', (req, res) => {
    const { title, content, author } = req.body;

    if (!title || !content) {
        return res.status(400).send('Title and content are required');
    }

    const query = 'INSERT INTO posts (title, content, author) VALUES (?, ?, ?)';
    db.query(query, [title, content, author], (err, result) => {
        if (err) {
            console.error('Error creating post:', err);
            return res.status(500).send('Error creating post');
        }
        const newPost = { id: result.insertId, title, content, author };
        res.status(201).json(newPost);
    });
});

// Edit a post by ID
app.put('/api/posts/:id', (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).send('Title and content cannot be empty!');
    }

    const query = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
    db.query(query, [title, content, postId], (err, result) => {
        if (err) {
            console.error('Error editing post:', err);
            return res.status(500).send('Error editing post');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Post not found');
        }

        res.status(200).json({ id: postId, title, content });
    });
});

// Delete a post by ID
app.delete('/api/posts/:id', (req, res) => {
    const postId = req.params.id;

    
    db.query('DELETE FROM comments WHERE post_id = ?', [postId], (err) => {
        if (err) {
            console.error('Error deleting comments:', err);
            return res.status(500).send('Error deleting comments');
        }

       
        db.query('DELETE FROM posts WHERE id = ?', [postId], (err, result) => {
            if (err) {
                console.error('Error deleting post:', err);
                return res.status(500).send('Error deleting post');
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Post not found');
            }

            res.status(204).send();
        });
    });
});

// Fetch comments for a specific post
app.get('/api/posts/:id/comments', (req, res) => {
    const postId = req.params.id;

    db.query('SELECT * FROM comments WHERE post_id = ?', [postId], (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).send('Error fetching comments');
        }
        res.status(200).json(results);
    });
});

// Add a comment to a specific post
app.post('/api/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    const { comment } = req.body;

    if (!comment) {
        return res.status(400).send('Comment cannot be empty');
    }

    const query = 'INSERT INTO comments (post_id, comment) VALUES (?, ?)';
    db.query(query, [postId, comment], (err, result) => {
        if (err) {
            console.error('Error adding comment:', err);
            return res.status(500).send('Error adding comment');
        }

        const newComment = { id: result.insertId, post_id: postId, comment };
        res.status(201).json(newComment);
    });
});

// Serve the React app (for production deployment)
app.use(express.static(path.join(__dirname, 'client/build'))); // <-- This line is now fixed

// Catch-all route for serving React app in production
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
