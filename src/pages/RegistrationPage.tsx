import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../redux/authSlice';
import '../index.css';

export const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    dispatch(registerUser(formData));
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h2>Create a profile</h2>
        <p>It only takes a minute.</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input type="text" id="name" onChange={handleChange} required />

          <label htmlFor="surname">Surname</label>
          <input type="text" id="surname" onChange={handleChange} required />

          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" onChange={handleChange} required />

          <label htmlFor="password">Password</label>
          <input type="password" id="password" onChange={handleChange} required />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" onChange={handleChange} required />

          <button type="submit">Create account</button>
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;