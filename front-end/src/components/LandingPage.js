import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Welcome to Event Management System</h1>
        <p>Your one-stop solution for managing events</p>
        <div className="landing-buttons">
          <button 
            className="landing-button primary"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
          <button 
            className="landing-button secondary"
            onClick={() => navigate('/events')}
          >
            Browse Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 