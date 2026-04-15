import { useEffect } from 'react';
import img1 from '../assets/1-Photoroom.png';
import img2 from '../assets/2-Photoroom.png';
import img3 from '../assets/3-Photoroom.png';
import '../styles/FeatureSection.css';

const FeatureSection = () => {
  // Logic to trigger animations when scrolling into view
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, observerOptions);

    const items = document.querySelectorAll('.feature-item-group, .content-header');
    items.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="feature-section-container">
      {/* Centered Header Content */}
      <div className="content-header reveal-item">
        <h2 className="feature-title">
          Looks polished, feels easy,<br />
          and makes <span className="text-gradient">sense right away.</span>
        </h2>

        <p className="feature-subtitle">
          The experience is built around real-time workflows:
          home snapshots, location visibility, calendar history,
          and fast entry, keeping your echoes organized.
        </p>
      </div>

      <div className="feature-visual-wrapper">
        {/* Feature 1: Left Text, Right Image */}
        <div className="feature-item-group">
          <div className="feature-text-content">
            <h3 className="feature-item-title" id="feat-core">Echo <span className="text-shimmer">Command Center</span></h3>
            <p className="feature-description">
              Orchestrate your digital presence. Seamlessly <strong>journal your memories</strong>,
              <strong>navigate</strong> to new horizons, and stay connected with a real-time feed
              of <strong>today's trending</strong> viral locations.
            </p>
          </div>
          <div className="feature-image-box">
            <img src={img1} alt="Visual representation of the Echo Command Center Dashboard showing feed, navigation, and trending tags" className="feature-img-item" />
          </div>
        </div>

        {/* Feature 2: Right Text, Left Image (Reversed) */}
        <div className="feature-item-group reversed">
          <div className="feature-text-content">
            <h3 className="feature-item-title">Resonance <span className="text-shimmer">Atlas</span></h3>
            <p className="feature-description">
              Discover the world with precision. Explore <strong>nearby locations</strong>—from cafes to hotels—and
              join <strong>local events</strong>. Build curated <strong>collections of saved places</strong>
              and track your personal journey through <strong>visual insights</strong> and contribution heatmaps.
            </p>
          </div>
          <div className="feature-image-box">
            <img src={img2} alt="Resonance Atlas interface showing nearby search, saved collections, and user insights" className="feature-img-item" />
          </div>
        </div>

        {/* Feature 3: Left Text, Right Image */}
        <div className="feature-item-group">
          <div className="feature-text-content">
            <h3 className="feature-item-title">AR Memory <span className="text-shimmer">Anchors</span></h3>
            <p className="feature-description">
              Immerse yourself in every journey. Explore through <strong>Street View</strong>,
              stay connected with <strong>integrated messaging</strong>, and <strong>anchor new Echoes</strong>
              to your current location to preserve your most vivid moments exactly where they were born.
            </p>
          </div>
          <div className="feature-image-box">
            <img src={img3} alt="AR Memory interface showing Street View, New Echo creation, messaging list, and live map navigation" className="feature-img-item" />
          </div>
        </div>

        {/* Subtle glow behind the image to add depth since the box is gone */}
        <div className="image-glow-base" />
      </div>
    </div>
  );
};

export default FeatureSection;