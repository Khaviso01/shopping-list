import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import type { AppDispatch } from '../redux/store';
import { registerUser } from '../redux/authSlice';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import '../index.css';

type FieldErrors = {
  name?: string;
  surname?: string;
  email?: string;
  cellNumber?: string;
  password?: string;
  confirmPassword?: string;
};

export const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    cellNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    // Clear that field's error as soon as the user starts fixing it
    if (errors[id as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }

    // For cellNumber, allow only numeric digits and max 10 characters
    if (id === 'cellNumber') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, cellNumber: numericValue });
      return;
    }

    setFormData({ ...formData, [id]: value });
  };

  const validate = (): FieldErrors => {
    const newErrors: FieldErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailPattern.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.cellNumber) {
      newErrors.cellNumber = 'Cell number is required';
    } else if (formData.cellNumber.length !== 10) {
      newErrors.cellNumber = 'Cell number must be exactly 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating your account...');

    // Omit confirmPassword from payload before dispatching
    const { confirmPassword: _confirmPassword, ...userPayload } = formData;

    // registerUser hashes the password with bcrypt before it is ever sent
    // to the server — the plain-text password never touches storage.
    const result = await dispatch(registerUser(userPayload));

    if (registerUser.fulfilled.match(result)) {
      toast.success(`Welcome, ${result.payload.name}!`, { id: toastId });
      navigate('/home');
    } else {
      toast.error((result.payload as string) || 'Registration failed.', { id: toastId });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h2>Create a profile</h2>
        <p>It only takes a minute.</p>

        {/* noValidate disables the browser's own validation popups — we
            show our own inline "field is required" messages instead. */}
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}

          <label htmlFor="surname">Surname</label>
          <input
            type="text"
            id="surname"
            placeholder="Enter your surname"
            value={formData.surname}
            onChange={handleChange}
            className={errors.surname ? 'input-error' : ''}
          />
          {errors.surname && <span className="field-error">{errors.surname}</span>}

          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}

          <label htmlFor="cellNumber">Cell Number</label>
          <input
            type="tel"
            id="cellNumber"
            value={formData.cellNumber}
            onChange={handleChange}
            placeholder="e.g. 0821234567"
            maxLength={10}
            className={errors.cellNumber ? 'input-error' : ''}
          />
          {errors.cellNumber && <span className="field-error">{errors.cellNumber}</span>}

          <label htmlFor="password">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
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
          {errors.password && <span className="field-error">{errors.password}</span>}

          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'input-error' : ''}
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
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;