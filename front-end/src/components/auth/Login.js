import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import '../../styles/Auth.css';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Check for error in URL params
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('message');
    
    if (error === 'auth_failed') {
      setError(errorMessage || 'Authentication failed. Please try again.');
    }

    // Handle Google auth callback
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('access_token', token);
      navigate('/landing');
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/landing');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    }
  };

  const handleGoogleLogin = () => {
    const callbackUrl = `${window.location.origin}/auth/callback`;
    console.log('Starting Google login with callback URL:', callbackUrl);
    window.location.href = `${config.API_URL}/auth/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>
          <button type="submit" className="auth-button">Sign In</button>
        </form>
        
        <div className="social-login">
          <button 
            type="button" 
            className="google-button"
            onClick={handleGoogleLogin}
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="google-icon"
            />
            Continue with Google
          </button>
        </div>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 