import React, { useState } from 'react';


const NewsletterForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add your submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
     className="flex flex-col justify-center items-center"

    >
      <h2 className="text-2xl font-bold text-left text-white-800">
        Subscribe to our Newsletter
      </h2>

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Your Name"
        className="w-1/2 h-10 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Your Email"
        className="w-1/2 h-10 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <button
        type="submit"
        className="w-1/3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Subscribe
      </button>
    </form>
  );
};

export default NewsletterForm;
