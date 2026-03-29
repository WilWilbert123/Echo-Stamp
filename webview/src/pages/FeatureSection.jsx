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
            <p className="feature-description">Orchestrate your digital presence. Seamlessly organize real-time activities into a high-fidelity stream of consciousness that flows at the speed of your life.</p>
          </div>
          <div className="feature-image-box">
            <img src={img1} alt="Visual representation of the Echo Command Center Dashboard" className="feature-img-item" />
          </div>
        </div>

        {/* Feature 2: Right Text, Left Image (Reversed) */}
        <div className="feature-item-group reversed">
          <div className="feature-text-content">
            <h3 className="feature-item-title">Resonance <span className="text-shimmer">Atlas</span></h3>
            <p className="feature-description">Visualize your global impact. Explore a living map of human stories and trace the unique frequency of your personal journey across the world.</p>
          </div>
          <div className="feature-image-box">
            <img src={img2} alt="Feature 2" className="feature-img-item" />
          </div>
        </div>

        {/* Feature 3: Left Text, Right Image */}
        <div className="feature-item-group">
          <div className="feature-text-content">
            <h3 className="feature-item-title">AR Memory <span className="text-shimmer">Anchors</span></h3>
            <p className="feature-description">Transcend physical boundaries. Drop immersive stamps into the real world to preserve your most vivid moments exactly where they were born.</p>
          </div>
          <div className="feature-image-box">
            <img src={img3} alt="Feature 3" className="feature-img-item" />
          </div>
        </div>

        {/* Subtle glow behind the image to add depth since the box is gone */}
        <div className="image-glow-base" />
      </div>
    </div>
  );
};

export default FeatureSection;