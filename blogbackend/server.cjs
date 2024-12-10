// server.cjs
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises; // Use promises for file system operations
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());  // Enable CORS for all requests
app.use(bodyParser.json());  // Parse JSON bodies

// Serve the React app (for production deployment)
app.use(express.static(path.join(__dirname, 'client/build')));

// File path to store blog posts
const postsFilePath = path.join(__dirname, 'posts.json');

// Initialize a queue to handle sequential file operations
let queue = Promise.resolve(); 

// Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        const data = await fs.readFile(postsFilePath, 'utf8');
        res.status(200).json(JSON.parse(data));  // Respond with JSON
    } catch (err) {
        console.error('Error reading posts:', err);
        res.status(500).send('Error reading posts');
    }
});

// Create a new post
app.post('/api/posts', (req, res) => {
    const { title, content } = req.body;

    // Check if title and content are provided
    if (!title || !content) {
        return res.status(400).send('Title and content are required');
    }

    queue = queue.then(async () => {
        try {
            const data = await fs.readFile(postsFilePath, 'utf8');
            const posts = JSON.parse(data);

            // Create a new post with a unique ID
            const newPost = { id: Date.now(), title, content };
            posts.push(newPost);

            // Write the updated posts array back to the file
            await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2));  // Pretty print the JSON
            res.status(201).json(newPost);  // Respond with the new post
        } catch (err) {
            console.error('Error processing request:', err);
            res.status(500).send('Error processing request');
        }
    });
});

// Delete a post by ID
app.delete('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);

    queue = queue.then(async () => {
        try {
            const data = await fs.readFile(postsFilePath, 'utf8');
            const posts = JSON.parse(data);

            // Filter out the post with the given ID
            const filteredPosts = posts.filter(post => post.id !== postId);

            // Write the updated posts array back to the file
            await fs.writeFile(postsFilePath, JSON.stringify(filteredPosts, null, 2));  // Pretty print the JSON
            res.status(204).send();  // Successfully deleted
        } catch (err) {
            console.error('Error processing request:', err);
            res.status(500).send('Error processing request');
        }
    });
});

// Catch-all route for serving React app in production
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
