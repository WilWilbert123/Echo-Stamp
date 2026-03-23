import { useRef, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Layout from './components/Layout';
 
import HomeContainer from './pages/HomeContainer';

function App() {
  
  const [page, setPage] = useState('landing'); 
  const homeRef = useRef(null);

  const scrollToSection = (index) => {
    if (page !== 'landing') {
      setPage('landing');
     
      setTimeout(() => homeRef.current?.scrollToSection(index), 100);
    } else {
      homeRef.current?.scrollToSection(index);
    }
  };

  const renderContent = () => {
    switch (page) {
      case 'landing': 
     
        return <HomeContainer ref={homeRef} onExplore={() => setPage('dashboard')} />;
  
      default: 
        return <HomeContainer ref={homeRef} onExplore={() => setPage('dashboard')} />;
    }
  };

  return (
    <div className="app-wrapper">
      <Header 
        setPage={setPage} 
        activePage={page} 
        scrollTo={scrollToSection}
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