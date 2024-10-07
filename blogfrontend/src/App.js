import React, { useState } from 'react';
import Homepage from './components/Homepage';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './Footer';
import Post from './Post';

const App = () => {
  const [posts, setPosts] = useState([]);

  const handlePostAdded = (newPost) => {
    setPosts((prevPosts) => [...prevPosts, newPost]);
  };

  return (
    <div>
      <Homepage posts={posts} onPostAdded={handlePostAdded} />
      {posts.map(post => (
        <Post key={post.id} title={post.title} content={post.content} author={post.author} date={post.date} />
      ))}
      <Footer />
    </div>
  );
};

export default App;
