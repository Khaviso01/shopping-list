import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { RootState } from '../redux/store';
import { updateProfile, logout } from '../redux/authSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ViewIcon,
  ViewOffIcon
} from '@hugeicons/core-free-icons';
import '../index.css';

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    cellNumber: user?.cellNumber || '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Extract confirmPassword and password from formData
    const { confirmPassword, password, ...restProfileData } = formData;

    // Only include password if the user entered a new value
    const profilePayload = password.trim()
      ? { ...restProfileData, password }
      : restProfileData;

    dispatch(updateProfile(profilePayload));
    alert('Profile updated successfully!');

    // Reset password inputs
    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <Link to="/home" className="back-home-link">
          <HugeiconsIcon icon={ArrowLeft02Icon} size={18} /> Home
        </Link>

        <h2>Profile Details</h2>
        <p>Update your personal information below.</p>

        <form className="signup-form" onSubmit={handleSave}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />

          <label htmlFor="surname">Surname</label>
          <input
            type="text"
            id="surname"
            value={formData.surname}
            onChange={handleChange}
            placeholder="Enter your surname"
          />

          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <label htmlFor="cellNumber">Cell Number</label>
          <input
            type="text"
            id="cellNumber"
            value={formData.cellNumber}
            onChange={handleChange}
            placeholder="Enter cell number"
          />

          <label htmlFor="password">New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
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

          <label htmlFor="confirmPassword">Confirm New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
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

          <button type="submit">Save Changes</button>
        </form>

        <div className="profile-actions">
          <button type="button" className="signout-btn" onClick={handleLogout}>
            Sign Out <HugeiconsIcon icon={ArrowRight02Icon} size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;