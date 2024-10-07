// Post.js
import React from 'react';
import './Post.css';

const Post = ({ title, content, author, date }) => {
    return (
        <div className="post">
            <h2>{title}</h2>
            <p>{content}</p>
            <p className="author">By: {author}</p>
            <p className="date">{date}</p>
        </div>
    );
};

export default Post;
