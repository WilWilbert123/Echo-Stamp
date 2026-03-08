import { useState } from 'react';
import Button from '../components/Button';
import '../styles/Auth.css';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="auth-page fade-in">
      {/* Dynamic Background Elements */}
      <div className="auth-mesh-gradient" />
      <div className="auth-glow-orb" />

      <div className="auth-content">
        <div className="logo-section">
          <h1 className="logo-text text-gradient">ECHO<span className="cyan-dot">.</span></h1>
          <p className="welcome-subtitle">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </p>
        </div>

        <div className="glass-card auth-card">
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input type="text" placeholder="Full Name" className="dark-input" required />
              </div>
            )}
            
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input type="email" placeholder="Email Address" className="dark-input" required />
            </div>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="dark-input" 
                required 
              />
              <button 
                type="button" 
                className="eye-icon" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>

            {isLogin && <p className="forgot-password">Forgot Password?</p>}

            <Button 
              type="submit" 
              variant="primary" 
              loading={loading} 
              className="full-width auth-submit-btn"
            >
              {isLogin ? 'Sign In' : 'Join Echo'}
            </Button>
          </form>

          <div className="social-section">
            <div className="divider"><span>OR CONTINUE WITH</span></div>
            <div className="social-icons">
              <button className="icon-circle">G</button>
              <button className="icon-circle">A</button>
              <button className="icon-circle">f</button>
            </div>
          </div>
        </div>

        <p className="auth-footer">
          {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
          <span className="signup-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;