import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { RootState } from '../redux/store';
import { updateProfile, logout } from '../redux/authSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft02Icon,
  Logout05Icon
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading('Updating profile...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      dispatch(updateProfile(formData));
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (error) {
      toast.error('Failed to update profile.', { id: toastId });
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Signed out successfully!');
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

          <button type="submit">Save Changes</button>
        </form>

        <div className="profile-actions">
          <button type="button" className="signout-btn" onClick={handleLogout}>
            <HugeiconsIcon icon={Logout05Icon} size={18} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;