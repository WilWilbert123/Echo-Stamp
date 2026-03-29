import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import '../styles/RatingsSection.css';

const RatingsSection = () => {
  const reviews = [
    { name: "Wilbert S.", rating: 5, text: "The AR anchors are a game changer. Stamping memories in the real world is addictive!" },
    { name: "Sarah M.", rating: 5, text: "Cleanest UI I've seen in a while. The resonance atlas makes total sense for tracking my journey." },
    { name: "Jordan K.", rating: 4, text: "Love the global map. Seeing where people 'echo' in real-time is absolutely fascinating." }
  ];

  return (
    <div className="ratings-section-container">
      <div className="ratings-header reveal-item">
        <h2 className="ratings-title">Loved by <span className="text-gradient">Echo Collectors</span></h2>
        <div className="rating-score">
          <span className="score-num">4.9</span>
          <div className="score-stars">
            {[...Array(5)].map((_, i) => <FaStar key={i} className="star-active" />)}
          </div>
          <span className="score-count">(2.4k Global Reviews)</span>
        </div>
      </div>

      <div className="reviews-grid">
        {reviews.map((rev, i) => (
          <div key={i} className="review-card">
            <div className="quote-badge">
              <FaQuoteLeft />
            </div>
            <p className="review-text">{rev.text}</p>
            <div className="review-footer">
              <div className="reviewer-info">
                <div className="avatar-placeholder">{rev.name[0]}</div>
                <span className="reviewer-name">{rev.name}</span>
              </div>
              <div className="reviewer-stars">
                {[...Array(rev.rating)].map((_, j) => (
                  <FaStar key={j} size={12} color="#00f2fe" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="ratings-glow" />
    </div>
  );
};

export default RatingsSection;