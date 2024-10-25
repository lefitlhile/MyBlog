const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database.cjs');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/posts', (req, res) => {
    db.query('SELECT * FROM posts', (err, results) => {
        if (err) return res.status(500).send('Error retrieving posts');
        res.send(results);
    });
});

app.post('/api/posts', (req, res) => {
    const { title, content, author_id } = req.body;
    db.query('INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)', [title, content, author_id], (err, results) => {
        if (err) return res.status(500).send('Error adding post');
        res.status(201).send({ id: results.insertId, title, content, author_id, created_at: new Date() });
    });
});

app.put('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const { title, content, author_id } = req.body;
    db.query('UPDATE posts SET title = ?, content = ?, author_id = ? WHERE id = ?', [title, content, author_id, id], (err, results) => {
        if (err) return res.status(500).send('Error updating post');
        res.send({ id, title, content, author_id });
    });
});

app.delete('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM posts WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send('Error deleting post');
        res.status(204).send();
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
