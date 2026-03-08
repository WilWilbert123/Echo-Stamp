import '../styles/Button.css';

const Button = ({ children, onClick, variant = 'primary', loading = false, type = "button", className = "" }) => {
  return (
    <button 
      type={type}
      className={`custom-btn ${variant} ${loading ? 'is-loading' : ''} ${className}`} 
      onClick={onClick}
      disabled={loading}
    >
      <span className="btn-content">
        {loading ? (
          <div className="btn-loader">
            <div className="spinner-dot" />
            <div className="spinner-dot" />
            <div className="spinner-dot" />
          </div>
        ) : (
          children
        )}
      </span>
      {/* Dynamic shine overlay seen in premium designs */}
      <div className="btn-shine" />
    </button>
  );
};

export default Button;