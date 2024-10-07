import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Homepage.css';
import NewPost from './NewPost'; 
import '../Footer'

const Homepage = () => {
  const [posts, setPosts] = useState([]); 
  const [error, setError] = useState(null);

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
    setPosts((prevPosts) => [newPost, ...prevPosts]); // Add new post to the top of the list
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete the post');
      }
      // Update state to remove the deleted post
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      setError(error.message);
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

      <div className="posts" id= "post">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <small>{`By ${post.author} on ${post.date}`}</small>
            <button 
              className="submit-button" 
              onClick={() => handleDeletePost(post.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;
