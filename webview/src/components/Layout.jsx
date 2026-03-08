import '../styles/Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      {/* Dynamic atmospheric glows that stay behind the content */}
      <div className="glow-container">
        <div className="glow-orb purple-glow" />
        <div className="glow-orb blue-glow" />
      </div>
      
      <main className="content-area">
        {children}
      </main>
      
      {/* Optional: Subtle noise texture for a high-end "real-world" feel */}
      <div className="grain-overlay" />
    </div>
  );
};

export default Layout;