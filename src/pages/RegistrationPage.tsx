import '../index.css';
import { Link } from 'react-router-dom';

export const RegistrationPage = () => {
  return (
    <div className="login-container">
      <div className="login-content">
        <h2>Create a profile</h2>
        <p>It only takes a minute.</p>

        <form className="signup-form">
          <label htmlFor="name">Name</label>

          <input
            type="text"
            id="name"
            placeholder="Enter your name"
          />

          <label htmlFor="surname">Surname</label>

          <input
            type="text"
            id="surname"
            placeholder="Enter your surname"
          />

          <label htmlFor="email">Email Address</label>

          <input
            type="email"
            id="email"
            placeholder="example@gmail.com"
          />

          <label htmlFor="password">Password</label>

          <input
            type="password"
            id="password"
            placeholder="Enter your password"
          />

          <label htmlFor="confirmPassword">Confirm Password</label>

          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm your password"
          />

          <button type="submit">Sign up</button>

          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;