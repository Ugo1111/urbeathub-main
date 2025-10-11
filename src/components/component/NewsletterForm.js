import React, { useState } from 'react';

const NewsletterForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="newsletter-form">
      <h2 className="newsletter-title">Don’t miss a beat</h2>
      <p>Want to grow your fanbase and music business with Ur BeatHub? Enter your name and email below.</p>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Your Name"
        className="newsletter-input"
        required
      />

      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Your Email"
        className="newsletter-input"
        required
      />

      <button type="submit" className="newsletter-button">
        Subscribe
      </button>
    </form>
  );
};

export default NewsletterForm;
