const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises; // Use promises for fs
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client/build')));

const postsFilePath = path.join(__dirname, 'posts.json');
let queue = Promise.resolve(); // Initialize a resolved promise

// Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        const data = await fs.readFile(postsFilePath, 'utf8');
        res.send(JSON.parse(data));
    } catch (err) {
        res.status(500).send('Error reading posts');
    }
});

// Get a single post by ID
app.get('/api/posts/:id', async (req, res) => {
    const postId = parseInt(req.params.id);

    try {
        const data = await fs.readFile(postsFilePath, 'utf8');
        const posts = JSON.parse(data);
        const post = posts.find(p => p.id === postId);
        
        if (post) {
            res.send(post);
        } else {
            res.status(404).send('Post not found');
        }
    } catch (err) {
        res.status(500).send('Error reading post');
    }
});

// Create a new post
app.post('/api/posts', (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).send('Title and content are required');
    }

    queue = queue.then(async () => {
        try {
            const data = await fs.readFile(postsFilePath, 'utf8');
            const posts = JSON.parse(data);
            const newPost = { id: Date.now(), title, content, comments: [] }; // Add comments array
            posts.push(newPost);
            await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2)); // Pretty-print JSON
            res.status(201).send(newPost);
        } catch (err) {
            res.status(500).send('Error processing request');
        }
    });
});

// Update an existing post
app.put('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).send('Title and content are required');
    }

    queue = queue.then(async () => {
        try {
            const data = await fs.readFile(postsFilePath, 'utf8');
            let posts = JSON.parse(data);
            // Find the post to update
            const postIndex = posts.findIndex(post => post.id === postId);
            if (postIndex === -1) {
                return res.status(404).send('Post not found');
            }

            // Update the post
            posts[postIndex] = { ...posts[postIndex], title, content };
            await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2)); // Pretty-print JSON
            res.send(posts[postIndex]); // Send the updated post back
        } catch (err) {
            res.status(500).send('Error processing request');
        }
    });
});

// Delete a post
app.delete('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);

    queue = queue.then(async () => {
        try {
            const data = await fs.readFile(postsFilePath, 'utf8');
            const posts = JSON.parse(data);
            const filteredPosts = posts.filter(post => post.id !== postId);
            await fs.writeFile(postsFilePath, JSON.stringify(filteredPosts, null, 2)); // Pretty-print JSON
            res.status(204).send();
        } catch (err) {
            res.status(500).send('Error processing request');
        }
    });
});

// Add a comment to a post
app.post('/api/posts/:id/comments', async (req, res) => {
    const postId = parseInt(req.params.id);
    const { comment } = req.body;

    if (!comment) {
        return res.status(400).send('Comment is required');
    }

    queue = queue.then(async () => {
        try {
            const data = await fs.readFile(postsFilePath, 'utf8');
            const posts = JSON.parse(data);
            const postIndex = posts.findIndex(post => post.id === postId);
            
            if (postIndex === -1) {
                return res.status(404).send('Post not found');
            }

            // Create a new comment object
            const newComment = { id: Date.now(), comment };
            
            // Add the new comment to the post's comments array
            posts[postIndex].comments.push(newComment);
            await fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2)); // Pretty-print JSON

            // Return the new comment
            res.status(201).send(newComment);
        } catch (err) {
            res.status(500).send('Error processing request');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
