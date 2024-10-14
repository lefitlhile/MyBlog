const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises; // Use promises for fs
const path = require('path');
const db = require('./database.cjs');


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
            const newPost = { id: Date.now(), title, content };
            posts.push(newPost);
            await fs.writeFile(postsFilePath, JSON.stringify(posts));
            res.status(201).send(newPost);
        } catch (err) {
            res.status(500).send('Error processing request');
        }
    });
});

// Update a post
app.put('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    db.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ id, title, content, });
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
            await fs.writeFile(postsFilePath, JSON.stringify(filteredPosts));
            res.status(204).send();
        } catch (err) {
            res.status(500).send('Error processing request');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
