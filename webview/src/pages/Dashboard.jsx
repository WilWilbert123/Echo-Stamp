import axios from 'axios';
import { useEffect, useState } from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [echos, setEchos] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchEchos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (user?._id) {
          const response = await axios.get(
            `https://echo-stamp.onrender.com/api/echoes/${user._id}/mood`, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEchos(response.data);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEchos();
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Gathering your echos...</p>
    </div>
  );

  return (
    <div className="dashboard-page">
      <header className="dash-header">
        <div className="welcome-text">
          <p className="subtitle">Welcome back, {user?.username || 'User'}</p>
          <h1>Your <span className="text-gradient">Echos</span></h1>
        </div>
        <div className="stats-pill">
          <span>{echos.length} Stamps Collected</span>
        </div>
      </header>

      {/* Quick Summary Bar */}
      <div className="summary-bar">
        <div className="stat-item glass-card">
          <span className="label">Total Echos</span>
          <span className="value">{echos.length}</span>
        </div>
        <div className="stat-item glass-card">
          <span className="label">Streaks</span>
          <span className="value">5 Days</span>
        </div>
      </div>

      <div className="echo-grid">
        {echos.length > 0 ? (
          echos.map((echo) => (
            <div key={echo._id} className="echo-card glass-card fade-in">
              <div className="card-top">
                <span className="date-tag">{new Date(echo.createdAt).toLocaleDateString()}</span>
                <div className={`status-dot ${echo.emotion?.toLowerCase() || 'neutral'}`}></div>
              </div>
              
              <div className="card-body">
                <h3 className="echo-title">{echo.title}</h3>
                <p className="echo-desc">{echo.description}</p>
              </div>

              <div className="card-footer">
                <span className="tag">#{echo.type}</span>
                {echo.location?.address && (
                  <span className="location">📍 {echo.location.address.split(',')[0]}</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state glass-card fade-in">
            <div className="empty-icon">📂</div>
            <h3>No Echos Found</h3>
            <p>You haven't collected any stamps yet. Start your journey today!</p>
            <button className="btn-main">Create Your First Echo</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;