import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import '../styles/Auth.css';
import logo_wildmart from '../assets/logo_wildmart.png';

const Login = ({ setAuth }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotForm, setShowForgotForm] = useState(false);
  const [forgotData, setForgotData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotChange = (e) => {
    setForgotData({
      ...forgotData,
      [e.target.name]: e.target.value
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    if (forgotData.newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters');
      return;
    }

    setIsResetting(true);
    try {
      await axios.post('http://localhost:8080/api/auth/reset-password', {
        email: forgotData.email,
        newPassword: forgotData.newPassword
      });
      setForgotSuccess('Password reset successfully! You can now login.');
      setForgotData({ email: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowForgotForm(false);
        setForgotSuccess('');
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAuth(true);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-visual">
          <div className="visual-circle">
            <img src={logo_wildmart} alt="WildMart Logo" className="login-logo" />
            <h2 className="gold-text">Welcome Back!</h2>
            <p className="gold-text">Sign in to continue</p>
          </div>
        </div>

        <div className="auth-form-section">
          <h2 className="auth-title">Login</h2>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button 
                type="button" 
                className="forgot-password"
                onClick={() => setShowForgotForm(true)}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>


            <div className="auth-footer">
              <p>
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            </div>
          </form>

          {/* Forgot Password Modal */}
          {showForgotForm && (
            <div className="forgot-modal-overlay">
              <div className="forgot-modal">
                <h3>Reset Password</h3>
                <form onSubmit={handleResetPassword}>
                  <div className="form-group">
                    <label htmlFor="forgot-email">Email</label>
                    <div className="input-with-icon">
                      <FaEnvelope className="input-icon" />
                      <input
                        type="email"
                        id="forgot-email"
                        name="email"
                        value={forgotData.email}
                        onChange={handleForgotChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="input-with-icon">
                      <FaLock className="input-icon" />
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={forgotData.newPassword}
                        onChange={handleForgotChange}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-with-icon">
                      <FaLock className="input-icon" />
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={forgotData.confirmPassword}
                        onChange={handleForgotChange}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>
                  {forgotError && <div className="error-message">{forgotError}</div>}
                  {forgotSuccess && <div className="success-message">{forgotSuccess}</div>}
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => {
                        setShowForgotForm(false);
                        setForgotError('');
                        setForgotSuccess('');
                        setForgotData({ email: '', newPassword: '', confirmPassword: '' });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={isResetting}>
                      {isResetting ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
