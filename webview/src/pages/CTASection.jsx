import Button from '../components/Button';
import '../styles/CTASection.css';

const CTASection = ({ onExplore }) => {
  return (
    <div className="cta-section-wrap">
      {/* Visual depth element */}
      <div className="end-glow-sphere" />
      
      <div className="content-wrap fade-in">
        <h2 className="cta-title">
          Ready to <br />
          <span className="text-gradient">Start Echoing?</span>
        </h2>
        <p className="cta-subtitle">
          Join a global network of collectors and streamline your digital 
          footprint with the power of Echo Stamps.
        </p>
        
        <div className="cta-actions">
          <Button variant="primary" onClick={onExplore} className="hero-cta">
            Get Started Now
          </Button>
        </div>
      </div>

      <footer className="landing-footer-note">
        <div className="footer-links">
          <span>Privacy</span> • <span>Terms</span> • <span>API</span>
        </div>
        <p>© 2026 ECHO. The Future of AI Today.</p>
      </footer>
    </div>
  );
};

export default CTASection;