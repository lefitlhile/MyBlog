import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Homepage.css';
import NewPost from './NewPost'; 
import { Modal, Button, Form } from 'react-bootstrap'; // Import React Bootstrap components
import '../Footer';

const Homepage = () => {
  const [posts, setPosts] = useState([]); 
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null); // Track post being edited
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false); // New state to track save operation
  const [comments, setComments] = useState({}); // State to store comments for each post
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [selectedPostId, setSelectedPostId] = useState(null); // Store the selected post ID for adding comments
  const [newComment, setNewComment] = useState(''); // New comment state

  // Fetch posts from the backend
  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPosts(data); // Set posts to the fetched data
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchPosts(); // Fetch posts when the component mounts
  }, []);

  // Add a new post to the list
  const handlePostAdded = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]); // Add new post to the top of the list
  };

  // Delete a post
  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete the post');
      }
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId)); // Remove the post from the list
    } catch (error) {
      setError(error.message);
    }
  };

  // Start editing a post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditedTitle(post.title);
    setEditedContent(post.content);
  };

  // Save the edited post
  const handleSaveEdit = async () => {
    if (!editedTitle || !editedContent) {
      alert('Title and content cannot be empty!');
      return;
    }

    setIsSaving(true); // Set saving to true

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${editingPost.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editedTitle, content: editedContent }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to update the post');
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      );
      setEditingPost(null); // Close the edit form
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false); // Reset saving state after the request completes
    }
  };

  // Fetch comments for a specific post
  const handleViewComments = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const post = await response.json();
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: post.comments || [], // Store comments for the specific post
      }));
    } catch (error) {
      setError(error.message);
    }
  };

  // Open the modal to add a comment
  const handleOpenModal = (postId) => {
    setSelectedPostId(postId);
    setShowModal(true);
  };

  // Handle the form submission for adding a comment
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment) {
      alert('Comment cannot be empty!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${selectedPostId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment: newComment }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const comment = await response.json();
      setComments((prevComments) => ({
        ...prevComments,
        [selectedPostId]: [...(prevComments[selectedPostId] || []), comment], // Add new comment to post's comments
      }));
      
      setNewComment(''); // Reset the new comment input field
      setShowModal(false); // Close the modal
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="homepage">
      <nav className="navbar navbar-expand-lg navbar-light fixed-top" style={{ backgroundColor: 'rgba(179, 218, 193, 0.9)' }}>
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
      
      <div className="welcome-section text-center mb-5" style={{ paddingTop: '100px' }}>
        <h1>Welcome to My Personal Blog</h1>
        <p>
          This blog is a space where I share my thoughts, experiences, and insights on various topics that inspire me. 
          Join me on this journey as I explore new ideas, share personal stories, and connect with fellow enthusiasts. 
          I hope you find the content enjoyable and engaging!
        </p>
      </div>

      <NewPost onPostAdded={handlePostAdded} /> 

      {editingPost && (
        <div className="edit-post-form mb-4">
          <h3>Edit Post</h3>
          <input
            type="text"
            className="form-control mb-2"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <textarea
            className="form-control mb-2"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows="4"
          />
          <button 
            className="btn btn-primary mt-2"
            onClick={handleSaveEdit}
            disabled={isSaving} // Disable button when saving
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      <div className="posts-card">
        <div className="card large-card">
          <div className="card-body">
            <h2 className="card-title">Posts</h2>
            {posts.map((post) => (
              <div key={post.id} className="card post-card mb-3 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{post.title}</h5>
                  <p className="card-text">{post.content}</p>
                  <footer className="blockquote-footer text-muted">
                    <small>{`By ${post.author} on ${post.date}`}</small>
                  </footer>
                  <div className="post-actions mt-3 d-flex justify-content-end">
                    <button 
                      className="btn btn-warning btn-sm mr-3"  // Use mr-1 for smaller space
                      onClick={() => handleEditPost(post)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-sm mr-1"  // Use mr-1 for smaller space
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete
                    </button>
                    <button 
                      className="btn btn-info btn-sm mr-1"  // Use mr-1 for smaller space
                      onClick={() => handleViewComments(post.id)}
                    >
                      View Comments
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm mr-1"
                      onClick={() => handleOpenModal(post.id)} // Open modal to add a comment
                    >
                      Add Comment
                    </button>
                  </div>
                  {comments[post.id] && (
                    <div className="comments mt-3">
                      <h5>Comments</h5>
                      <ul>
                        {comments[post.id].map((comment) => (
                          <li key={comment.id}>{comment.comment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for adding comment */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddComment}>
            <Form.Group controlId="comment">
              <Form.Label>Your Comment</Form.Label>
              <Form.Control 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Enter your comment"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Comment
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Homepage;
