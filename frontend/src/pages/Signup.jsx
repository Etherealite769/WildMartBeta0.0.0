import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
import '../styles/Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Real-time validation for specific fields
    let fieldError = null;
    
    if (name === 'email' && value && !validateEmail(value)) {
      fieldError = 'Email must be a valid @gmail.com account.';
    } else if (name === 'phone' && value && !validatePhone(value)) {
      fieldError = 'Phone number must be 11 digits and start with 09.';
    } else if (name === 'password' && value && !validatePassword(value)) {
      fieldError = 'Password must be alphanumeric and at least 8 characters long.';
    } else if (name === 'confirmPassword' && value && formData.password !== value) {
      fieldError = 'Passwords do not match.';
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.username.trim()) newErrors.username = 'Username is required.';
    if (!formData.address.trim()) newErrors.address = 'Address is required.';
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email must be a valid @gmail.com account.';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Phone number must be 11 digits and start with 09.';
    }

    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be alphanumeric and at least 8 characters long.';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleNext = () => {
    const step1Errors = validateStep1();
    setErrors(step1Errors);

    if (Object.keys(step1Errors).length === 0) {
      nextStep();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const step2Errors = validateStep2();
    const step1Errors = validateStep1(); // Re-validate step 1 in case data was modified
    
    const allErrors = { ...step1Errors, ...step2Errors };
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      setError('Please fix the validation errors before submitting.');
      return;
    }
    
    setIsLoading(true);

    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        password: formData.password
      });
      
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in.' 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-visual">
          <div className="visual-circle">
            <h2>Welcome to WildMart</h2>
            <p>Join our community today</p>
          </div>
        </div>

        <div className="auth-form-section">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">
            Step {step} of 2: {step === 1 ? 'Personal Information' : 'Account Security'}
          </p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {step === 1 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <div className="input-with-icon">
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                        autoFocus
                      />
                    </div>
                    {errors.firstName && <small className="error-text">{errors.firstName}</small>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <div className="input-with-icon">
                      <FaUser className="input-icon" />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                      />
                    </div>
                    {errors.lastName && <small className="error-text">{errors.lastName}</small>}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-with-icon">
                    <FaIdCard className="input-icon" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                  {errors.username && <small className="error-text">{errors.username}</small>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@gmail.com"
                      required
                    />
                  </div>
                  {errors.email && <small className="error-text">{errors.email}</small>}
                  <small className="hint-text">Must be a valid @gmail.com account</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Philippine Phone Number</label>
                  <div className="input-with-icon">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="09123456789"
                      pattern="^09\d{9}$"
                      title="Please enter a valid 11-digit Philippine mobile number starting with 09"
                      required
                    />
                  </div>
                  {errors.phone && <small className="error-text">{errors.phone}</small>}
                  <small className="hint-text">Must be 11 digits starting with 09</small>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <div className="input-with-icon">
                    <FaMapMarkerAlt className="input-icon" />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Your full address"
                      required
                    />
                  </div>
                  {errors.address && <small className="error-text">{errors.address}</small>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
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
                      placeholder="Create a strong password"
                      required
                    />
                  </div>
                  {errors.password && <small className="error-text">{errors.password}</small>}
                  <small className="hint-text">Must be alphanumeric and at least 8 characters long</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  {errors.confirmPassword && <small className="error-text">{errors.confirmPassword}</small>}
                </div>
              </>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="form-navigation">
              {step > 1 && (
                <button type="button" className="btn-secondary" onClick={prevStep}>
                  Back
                </button>
              )}
              {step < 2 ? (
                <button type="button" className="btn-primary" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>

            <div className="auth-footer">
              <p>
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;