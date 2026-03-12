import '../styles/FeatureSection.css';

const FeatureSection = () => {
  return (
    <div className="feature-section-container">
      <div className="content-wrap fade-in">
        <div className="badge">🚀 PERFORMANCE</div>
        <h2 className="hero-title">
          Real-Time <br />
          <span className="text-gradient">Insights</span>
        </h2>
        <p className="hero-subtitle">
          Our proprietary engine processes voice data with sub-millisecond latency, 
          turning every echo into actionable intelligence.
        </p>

        <div className="glass-card visual-demo-box">
        
          <div className="moving-grid-bg" />
          
          <div className="stat-row">
            <div className="stat-item">
              <h3 className="text-gradient">10K+</h3>
              <p>Echoes Synced</p>
            </div>
            <div className="stat-separator" />
            <div className="stat-item">
              <h3 className="text-gradient">99.9%</h3>
              <p>Node Uptime</p>
            </div>
          </div>
          
          {/* Decorative scanner line */}
          <div className="scanner-line" />
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
