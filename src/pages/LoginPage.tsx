import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as CryptoJS from 'crypto-js';
import type { RootState } from '../redux/store';
import { loginUser } from '../redux/authSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import '../index.css';

const SECRET_KEY = 'shopping-list-secret-key';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Retrieve saved user data from Redux state (or local storage fallback)
  const user = useSelector((state: RootState) => state.auth.user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    // Check if user account exists
    if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
      alert('No account found with this email address.');
      return;
    }

    // Decrypt the stored encrypted password
    try {
      const bytes = CryptoJS.AES.decrypt(user.password || '', SECRET_KEY);
      const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (password !== decryptedPassword) {
        alert('Incorrect password. Please try again.');
        return;
      }

      dispatch(loginUser({ email }));
      navigate('/home');
    } catch (error) {
      alert('Error verifying credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h2>Welcome back</h2>
        <p>Sign in to pick up your shopping lists right where you left them.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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

          <button type="submit">Sign in</button>
          <p>
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;