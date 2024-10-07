import React, { useState } from 'react';
import './NewPost.css'; // Import the CSS file

const NewPost = ({ onPostAdded }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const newPost = { 
        id: Date.now(), 
        title, 
        content, 
        author: 'Your Author Name', 
        date: new Date().toLocaleDateString() 
      };

      if (onPostAdded) {
        onPostAdded(newPost);
      }

      setTitle('');
      setContent('');
      setError(null);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-post-container">
      <form onSubmit={handleSubmit} className="new-post-form">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="form-group">
          <label htmlFor="postTitle">Post Title</label>
          <input
            id="postTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Title"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="postContent">Post Content</label>
          <textarea
            id="postContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post Content"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Adding...' : 'Add Post'}
        </button>
      </form>
    </div>
  );
};

export default NewPost;
