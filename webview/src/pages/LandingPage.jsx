import Button from '../components/Button';
import '../styles/LandingPage.css';

const LandingPage = ({ onExplore }) => {
  return (
    <div className="landing-wrapper">
      {/* Background Mesh Gradients */}
      <div className="glow-container">
        <div className="glow-orb purple-orb" />
        <div className="glow-orb blue-orb" />
      </div>

      <div className="landing-content">
        <section className="hero-section fade-in">
          <div className="hero-badge">THE FUTURE OF ECHO TODAY</div>
          
          <h1 className="hero-title">
            Next-Gen <span className="text-gradient">Echos</span> <br />
            for a <span className="text-shimmer">Smarter World</span>
          </h1>
          
          <p className="hero-subtitle">
            Collect stamps that streamline your progress, boost efficiency, 
            and drive personal success through voice-driven data.
          </p>
          
          <Button 
            variant="primary" 
            onClick={onExplore} 
            className="hero-cta"
          >
            Explore Now
          </Button>
        </section>

        {/* Unified 3-Column Grid */}
        <div className="feature-grid">
          
          {/* Card 1: 1.6fr width (Large) */}
          <div className="feature-card large glass-card fade-in delay-1">
            <div className="card-info">
              <h3 className="card-title text-gradient">Echo Solutions for Every Industry</h3>
              <p className="card-desc">Customizable, scalable, and tailored to meet your unique challenges.</p>
              <Button variant="secondary" className="card-btn-small">
                Visit industry →
              </Button>
            </div>
            <div className="card-visual-wrapper">
               <div className="industry-abstract-visual">
                  <div className="abstract-orb" />
               </div>
            </div>
          </div>

          {/* Card 2: 1fr width (Data) */}
          <div className="feature-card small glass-card fade-in delay-2">
            <div className="card-header">
               <span className="icon-badge">📊</span>
               <h3 className="card-title">Power of Data</h3>
            </div>
            <div className="visual-stack-bars">
               <div className="bar" style={{height: '40%'}} />
               <div className="bar" style={{height: '70%'}} />
               <div className="bar" style={{height: '100%'}} />
               <div className="bar" style={{height: '60%'}} />
               <div className="bar" style={{height: '80%'}} />
            </div>
          </div>

          {/* Card 3: 1fr width (Productivity) */}
          <div className="feature-card small glass-card fade-in delay-3">
            <div className="bolt-header">
               <div className="icon-bolt-glow">⚡</div>
               <span className="cyan-dot-ping">Active System</span>
            </div>
            <p className="card-desc">Maximize productivity with Echo solutions built to optimize your performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;