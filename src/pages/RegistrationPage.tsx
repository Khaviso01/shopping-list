import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../redux/authSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import '../index.css';

export const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    cellNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    // For cellNumber, allow only numeric digits and max 10 characters
    if (id === 'cellNumber') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, cellNumber: numericValue });
      return;
    }

    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate 10-digit cell number length
    if (formData.cellNumber.length !== 10) {
      alert('Cell number must be exactly 10 digits!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    // Omit confirmPassword from payload before dispatching
    const { confirmPassword, ...userPayload } = formData;

    dispatch(registerUser(userPayload));
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h2>Create a profile</h2>
        <p>It only takes a minute.</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="surname">Surname</label>
          <input
            type="text"
            id="surname"
            placeholder="Enter your surname"
            value={formData.surname}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="cellNumber">Cell Number</label>
          <input
            type="tel"
            id="cellNumber"
            value={formData.cellNumber}
            onChange={handleChange}
            placeholder="e.g. 0821234567"
            maxLength={10}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={18} />
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle confirm password visibility"
            >
              <HugeiconsIcon icon={showConfirmPassword ? ViewOffIcon : ViewIcon} size={18} />
            </button>
          </div>

          <button type="submit">Create account</button>
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;