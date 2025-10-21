import React from "react";
import { useParams, Link } from "react-router-dom";
import blogPosts from "./blogData"; // ✅ same folder
import "../css/Blog.css";

export default function BlogPost() {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === parseInt(id));

  if (!post) {
    return <h2>Post not found</h2>;
  }

  return (
    <div className="post-files">
      <img src={post.image} alt={post.title} className="post-image" />
      <h1>{post.title}</h1>
      <p className="post-details">{post.content}</p>
      <Link to="/blog" className="back-link">← Back to Blog</Link>
    </div>
  );
}
