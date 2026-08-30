import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import type { AppDispatch } from '../redux/store';
import { loginUser } from '../redux/authSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffIcon, ShopifyIcon } from '@hugeicons/core-free-icons';
import '../index.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Signing in...');

    // loginUser fetches the stored password hash from json-server and
    // verifies it with bcrypt.compare — the hash is never decrypted.
    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.name}!`, { id: toastId });
      navigate('/home');
    } else {
      toast.error((result.payload as string) || 'Login failed.', { id: toastId });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title"><HugeiconsIcon icon={ShopifyIcon} size={44} /> ShopBuddy</h1>
        <p>Sign in to pick up your shopping list right where you left it.</p>

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

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
          <p>
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
