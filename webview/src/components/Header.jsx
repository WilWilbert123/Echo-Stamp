import { useEffect, useState } from 'react';
import { FaGooglePlay, FaMoon, FaSun } from 'react-icons/fa';
import '../styles/Header.css';
 
import echoLogo from '../assets/echologo.ico';

const Header = ({ scrollTo, isDark, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let scrollContainer = null;
    let handleScroll = null;

  
    const setupListener = () => {
      scrollContainer = document.querySelector('.scroll-snap-container');
      
      if (scrollContainer) {
        handleScroll = () => {
          // Use a small buffer to ensure snap points don't cause jitter
          setIsScrolled(scrollContainer.scrollTop > 20);
        };
        scrollContainer.addEventListener('scroll', handleScroll);
        handleScroll();  
      }
    };

    const timer = setTimeout(setupListener, 100);

    return () => {
      clearTimeout(timer);
      if (scrollContainer && handleScroll) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <header className="main-header">
      <nav className={`header-glass-pill ${isScrolled ? 'scrolled' : ''}`} aria-label="Primary">
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
          <span onClick={() => scrollTo(0)}>Preview</span>
          <span onClick={() => scrollTo(1)}>Features</span>
          <span onClick={() => scrollTo(2)}>Ratings</span>
        </div>

        {/* Theme Toggle */}
        <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
          {isDark ? <FaSun /> : <FaMoon />}
        </button>

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