import { useEffect, useRef } from 'react';
import Button from '../components/Button';
import '../styles/CTASection.css';

const CTASection = ({ onExplore }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, { threshold: 0.1 });

    if (contentRef.current) observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="cta-section-wrap">
      <div className="end-glow-sphere" />
      
      <div className="cta-content-container" ref={contentRef}>
       
        
        <h2 className="cta-title">
          Ready to <br />
          <span className="text-gradient text-shimmer">Start Echoing?</span>
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

      <footer className="landing-footer">
        <div className="footer-line" />
        <div className="footer-content">
          <div className="footer-links">
            <span>Privacy</span> • <span>Terms</span> • <span>API</span>
          </div>
          <p className="copyright-text">© 2026 ECHO STAMP. Redefining Digital Resonance.</p>
        </div>
      </footer>
    </div>
  );
};

export default CTASection;