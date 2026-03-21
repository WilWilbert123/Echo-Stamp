import NetInfo from '@react-native-community/netinfo';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

const NoInternet = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
 
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected !== false);
    }).catch(() => {
       
        setIsConnected(true); 
    });

    const unsubscribe = NetInfo.addEventListener(state => {
     
      if (state) {
        setIsConnected(state.isConnected !== false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <View style={styles.overlay}>
      <LottieView
       
        source={require('../assets/Wifi.json')} 
        autoPlay
        loop
        style={styles.lottie}
       
        onAnimationFailure={(error) => console.log("Lottie Error:", error)}
      />
    </View>
  );
};

export default NoInternet;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',  
    alignItems: 'center',     
    zIndex: 9999,
    elevation: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  lottie: {
    width: width * 0.4, 
    height: width * 0.4,
  },
});