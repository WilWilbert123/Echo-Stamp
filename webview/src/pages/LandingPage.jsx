import echoPhone from '../assets/echostyle.png';
import Button from '../components/Button';
import '../styles/LandingPage.css';

const LandingPage = ({ onExplore }) => {
  return (
    <div className="landing-wrapper">
      {/* Mesh Glow Background */}
      <div className="glow-container">
        <div className="glow-orb purple-orb" />
        <div className="glow-orb blue-orb" />
      </div>

      <div className="landing-content">
        <section className="hero-split-container fade-in">
          <div className="hero-text-content">
            <h1 className="hero-title">
              Next-Gen <span className="text-gradient">Echos</span> <br />
              for a <span className="text-shimmer">Smarter World</span>
            </h1>
            
            <p className="hero-subtitle">
              Collect stamps that streamline your progress, boost efficiency, 
              and drive personal success through voice-driven data.
            </p>
            
            <div className="hero-actions">
              <Button variant="primary" onClick={onExplore} className="hero-cta">
                Explore Now
              </Button>
              <div className="play-store-badge-mini">
                Available on Play Store
              </div>
            </div>
          </div>

          <div className="hero-visual-content">
            <div className="phone-mockup-wrapper">
              <img src={echoPhone} alt="Echo Stamp App" className="phone-image" />
              <div className="phone-glow"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;