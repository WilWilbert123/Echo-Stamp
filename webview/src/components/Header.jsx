import { FaGooglePlay } from 'react-icons/fa';
import '../styles/Header.css';
 
import echoLogo from '../assets/echologo.ico';

const Header = ({ scrollTo }) => {
  return (
    <header className="main-header">
      <nav className="header-glass-pill" aria-label="Primary">
        {/* Brand/Logo Section */}
        <div className="logo-section" onClick={() => scrollTo(0)}>
          <span className="glass-nav__mark">
            <img 
              src={echoLogo} 
              alt="Echo Stamp Logo" 
              className="glass-nav__logo" 
            />
          </span>
          <span className="brand-name"><strong>Echo</strong></span>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <span onClick={() => scrollTo(1)}>Preview</span>
          <span onClick={() => scrollTo(2)}>Features</span>
          <span onClick={() => scrollTo(3)}>Ratings</span>
        </div>

        {/* Play Store CTA */}
        <a 
          href="https://play.google.com/store" 
          target="_blank" 
          rel="noreferrer" 
          className="glass-nav__cta"
        >
          <FaGooglePlay className="inline-icon" />
          Play Store
        </a>
      </nav>
    </header>
  );
};

export default Header;