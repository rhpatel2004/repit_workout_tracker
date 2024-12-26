import React, { useState } from 'react';
import "./login.css"

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle forgot password logic here, send email to backend
    console.log('Forgot Password Email:', email);

    // Simulate API call
    setMessage('If this email exists in our system, a reset link will be sent to it.');
  };

  return (
    <div className="forgot-password-container">
      <h3>Reset Your Password</h3>
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-btn">Send Reset Link</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
