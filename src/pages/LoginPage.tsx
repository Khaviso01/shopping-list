import '../index.css';
import { Link } from 'react-router-dom';

function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-content">
        <h2>Welcome back</h2>
        <p>Sign in to your account to continue.</p>

        <form className="login-form">
          <label htmlFor="email">Email Address</label>

          <input
            type="email"
            id="email"
            placeholder="Enter your email address"
          />

          <label htmlFor="password">Password</label>

          <input
            type="password"
            id="password"
            placeholder="Enter your password"
          />

          <p>New here? <Link to="/register">Create an account</Link></p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage