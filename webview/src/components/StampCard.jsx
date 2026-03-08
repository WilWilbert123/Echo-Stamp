import '../styles/StampCard.css';

const StampCard = ({ data }) => {
  // Destructuring with fallbacks for a clean UI even if data is missing
  const { title, date, location, imageUrl, type } = data;

  return (
    <div className="stamp-card glass-card fade-in">
      <div className="stamp-image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="stamp-img" />
        ) : (
          <div className="stamp-placeholder">
            <span className="placeholder-icon">📷</span>
          </div>
        )}
        {/* Type badge overlay (e.g., #Mood, #Travel) */}
        {type && <div className="stamp-type-tag">#{type}</div>}
      </div>

      <div className="stamp-info">
        <h3 className="stamp-title">{title || "Untitled Moment"}</h3>
        <div className="stamp-meta">
          <div className="meta-item">
            <span className="meta-icon">📍</span>
            <span className="meta-text">{location || "Secret Place"}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">🗓️</span>
            <span className="meta-text">{date || "Today"}</span>
          </div>
        </div>
      </div>

      {/* The Seal: A circular decorative icon that makes it look like a physical stamp */}
      <div className="stamp-seal">
        <div className="seal-inner">
          <span className="seal-logo">E</span>
        </div>
      </div>
    </div>
  );
};

export default StampCard;