import featurePreview from '../assets/4echo.png';
import '../styles/FeatureSection.css';

const FeatureSection = () => {
  return (
    <div className="feature-section-container">
      {/* Centered Header Content */}
      
        <h2 className="feature-title">
          Looks polished, feels easy,<br />
          and makes <span className="text-gradient">sense right away.</span>
        </h2>
        
        <p className="feature-subtitle">
          The experience is built around real-time workflows: 
          home snapshots, location visibility, calendar history, 
          and fast entry, keeping your echoes organized.
        </p>
       

      {/* Main Feature Image - No Glass Container */}
      <div className="feature-visual-wrapper fade-in delay-1">
        <img 
          src={featurePreview} 
          alt="4Echo App Interface Preview" 
          className="feature-full-img" 
        />
        {/* Subtle glow behind the image to add depth since the box is gone */}
        <div className="image-glow-base" />
      </div>
    </div>
  );
};

export default FeatureSection;