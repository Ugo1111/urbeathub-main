import React from "react";
import { Link } from "react-router-dom";
import blogPosts from "./blogData"; // ✅ same folder
import "../css/Blog.css"; 

export default function Blog() {
  return (
    <div className="blog-container">
      <h2 className="blog-title">Producer Tips & Updates</h2>
      <div className="blog-grid">
        {blogPosts.map((post) => (
          <div key={post.id} className="blog-card">
            <img src={post.image} alt={post.title} className="blog-image" />
            <div className="blog-content">
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <Link to={`/blog/${post.id}`} className="read-more">
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
