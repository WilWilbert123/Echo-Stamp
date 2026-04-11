import * as Location from 'expo-location';
import { useEffect } from 'react';
import { Alert } from 'react-native';
export const useLocation = (showDirections, routeCoordinates, setUserLocation, setArrowHeading) => {
  
  const calculateHeading = (currentPos, path) => {
    if (path.length < 2) return;
    const nextPoint = path[1];
    const r2d = 180 / Math.PI;
    const dLon = nextPoint.longitude - currentPos.longitude;
    const dLat = nextPoint.latitude - currentPos.latitude;
    const angle = Math.atan2(dLon, dLat) * r2d;
    setArrowHeading(angle);
  };

  useEffect(() => {
    let locationSubscription;
    let headingSubscription;

    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "We need location access to show where you are.");
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 0.5, // Update even on tiny movements
          timeInterval: 500,    // Update twice a second for smoothness
        },
        (location) => {
          const newCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(newCoords);
        }
      );

      // Add heading tracking to detect phone rotation like a compass
      headingSubscription = await Location.watchHeadingAsync((data) => {
        const heading = data.trueHeading || data.magHeading;
        setArrowHeading(heading);
      });
    };

    startTracking();
    return () => { 
      if (locationSubscription) locationSubscription.remove(); 
      if (headingSubscription) headingSubscription.remove();
    };
  }, [showDirections, routeCoordinates]);
};