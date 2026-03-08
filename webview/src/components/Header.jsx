import '../styles/Header.css';

const Header = ({ scrollTo, onAuthClick }) => {
  return (
    <header className="main-header">
      <div className="header-glass-pill">
        <div className="logo" onClick={() => scrollTo(0)}>
          ECHO<span className="dot">.</span>
        </div>

        <nav className="nav-menu">
          <span onClick={() => scrollTo(0)}>Solutions</span>
          <span onClick={() => scrollTo(1)}>Technology</span>
          <span onClick={() => scrollTo(1)}>Industries</span>
          <span onClick={() => scrollTo(2)}>About Us</span>
        </nav>

        <div className="auth-buttons">
          <button className="btn-login" onClick={() => onAuthClick('login')}>Login</button>
          <button className="btn-signup" onClick={() => onAuthClick('signup')}>Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Header;