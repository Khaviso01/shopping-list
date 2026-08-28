import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../redux/store';
import { updateProfile, logout } from '../redux/authSlice';
import { clearItems } from '../redux/shoppingListSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft02Icon,
  Logout05Icon,
  ViewIcon,
  ViewOffIcon,
} from '@hugeicons/core-free-icons';
import '../index.css';

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    cellNumber: user?.cellNumber || '',
    newPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Updating profile...');

    const { newPassword, ...profileFields } = formData;

    // If the user typed a new password it is re-hashed with bcrypt before
    // being saved — the old hash is discarded, never decrypted or reused.
    const result = await dispatch(
      updateProfile({
        id: user.id,
        ...profileFields,
        ...(newPassword ? { password: newPassword } : {}),
      })
    );

    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!', { id: toastId });
      setFormData((prev) => ({ ...prev, newPassword: '' }));
    } else {
      toast.error((result.payload as string) || 'Failed to update profile.', { id: toastId });
    }
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearItems());
    toast.success('Signed out successfully!');
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <Link to="/home" className="back-home-link">
          <HugeiconsIcon icon={ArrowLeft02Icon} size={18} /> Home
        </Link>

        <h2>Profile</h2>
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

          <label htmlFor="newPassword">New Password (optional)</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
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

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
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
