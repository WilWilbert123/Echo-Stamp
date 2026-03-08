import { createContext, useEffect, useState } from 'react';

export const NativeDataContext = createContext();

export const NativeDataProvider = ({ children }) => {
  const [stamps, setStamps] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleMobileData = () => {
      if (window.mobileData) {
        console.log("Data received from Mobile Bridge");
        setStamps(window.mobileData.echoes || []);
        setUser(window.mobileData.user || null);
        setLoading(false);
      }
    };

    // Listen for the custom event we dispatched in the Mobile App
    window.addEventListener('mobileDataReady', handleMobileData);
    
    // Check if data is already there (race condition safety)
    if (window.mobileData) handleMobileData();

    return () => window.removeEventListener('mobileDataReady', handleMobileData);
  }, []);

  return (
    <NativeDataContext.Provider value={{ stamps, user, loading }}>
      {children}
    </NativeDataContext.Provider>
  );
};