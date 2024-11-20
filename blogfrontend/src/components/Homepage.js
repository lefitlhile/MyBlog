import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Homepage.css';
import NewPost from './NewPost';
import '../Footer';


const Homepage = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', author_id: '' });

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/posts');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePostAdded = (newPost) => {
        setPosts((prevPosts) => [newPost, ...prevPosts]);
    };

    const handleDeletePost = async (postId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete the post');
            }
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditPost = async (postId) => {
        const postToEdit = posts.find(post => post.id === postId);
        if (postToEdit) {
            setEditingPost(postId);
            setEditForm({ title: postToEdit.title, content: postToEdit.content, author_id: postToEdit.author_id });
        }
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        const { title, content, author_id } = editForm;
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${editingPost}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, author_id }),
            });
            if (!response.ok) {
                throw new Error('Failed to update the post');
            }
            const updatedPost = await response.json();
            setPosts((prevPosts) =>
                prevPosts.map((post) => (post.id === editingPost ? updatedPost : post))
            );
            setEditingPost(null);
            setEditForm({ title: '', content: '', author_id: '' });
        } catch (error) {
        }
      };

  return (
    <div className="homepage">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">My Personal Blog</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <a className="nav-link" href="/">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#post">Posts</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#Footer">Contact</a>
            </li>
          </ul>
        </div>
      </nav>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="welcome-section">
        <h1>Welcome to My Personal Blog</h1>
        <p>
          This blog is a space where I share my thoughts, experiences, and insights on various topics that inspire me. 
          Join me on this journey as I explore new ideas, share personal stories, and connect with fellow enthusiasts. 
          I hope you find the content enjoyable and engaging!
        </p>
      </div>

      <NewPost onPostAdded={handlePostAdded} /> 

      {editingPost && (
        <form onSubmit={handleUpdatePost} className="edit-post-form">
          <h2>Edit Post</h2>
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            placeholder="Title"
            required
          />
          <textarea
            value={editForm.content}
            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
            placeholder="Content"
            required
          />
          <input
            type="text"
            value={editForm.author}
            onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
            placeholder="Author"
            required
          />
          <div className="button-group">
            <button type="submit" className="submit-button">Update Post</button>
            
            <button type="button" onClick={() => setEditingPost(null)} className="cancel-button">Cancel</button>
          </div>
        </form>
      )}

      <div className="posts" id="post">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <small>{`By ${post.author} on ${post.date}`}</small>
            <div className="button-group">
              <button className="submit-button" onClick={() => handleEditPost(post.id)}>
                Edit
              </button>
              <button 
                className="submit-button" 
                onClick={() => handleDeletePost(post.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;
