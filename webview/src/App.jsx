import { useRef, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import HomeContainer from './pages/HomeContainer';

function App() {
  const [page, setPage] = useState('landing');
  const homeRef = useRef(null);

  // Navigates between Snap Sections (Home, Features, Join)
  const scrollToSection = (index) => {
    if (page !== 'landing') {
      setPage('landing');
      // Timeout allows HomeContainer to mount before scrolling
      setTimeout(() => homeRef.current?.scrollToSection(index), 100);
    } else {
      homeRef.current?.scrollToSection(index);
    }
  };

  const renderContent = () => {
    switch (page) {
      case 'landing': 
        return <HomeContainer ref={homeRef} onExplore={() => setPage('auth')} />;
      case 'auth': 
        return <Auth onLogin={() => setPage('dashboard')} />; 
      case 'dashboard': 
        return <Dashboard />;
      default: 
        return <HomeContainer ref={homeRef} />;
    }
  };

  return (
    <div className="app-wrapper">
      <Header 
        setPage={setPage} 
        activePage={page} 
        scrollTo={scrollToSection}
        onAuthClick={() => setPage('auth')} 
      />
      <Layout>
        <div key={page} className="fade-in">
          {renderContent()}
        </div>
      </Layout>
    </div>
  );
}

export default App;