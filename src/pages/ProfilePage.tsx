import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../redux/store';
import { updateProfile, logout } from '../redux/authSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProfile(formData));
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <button type="button" className="secondary-btn" onClick={() => navigate('/home')}>
            Back to Home
          </button>
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

          <button type="submit">Save Changes</button>
        </form>

        <div className="profile-actions">
          <button type="button" className="signout-btn" onClick={handleLogout}>
            Sign Out <HugeiconsIcon icon={ArrowRight02Icon} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;