import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Auth.css';
import config from '../../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isResetSent, setIsResetSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post(`${config.API_URL}/auth/forgot-password`, { email });
      setMessage(response.data.message);
      setIsResetSent(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred while processing your request. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Forgot Password</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        {!isResetSent ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button type="submit" className="auth-button">Send Reset Link</button>
          </form>
        ) : (
          <div className="reset-sent">
            <p>If an account exists with this email, you will receive a password reset link.</p>
            <button 
              className="auth-button"
              onClick={() => navigate('/login')}
            >
              Return to Login
            </button>
          </div>
        )}
        
        <p className="auth-link">
          Remember your password? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword; 