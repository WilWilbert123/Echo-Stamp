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

    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "We need location access to show where you are.");
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
        },
        (location) => {
          const newCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(newCoords);

          if (showDirections && routeCoordinates.length > 0) {
            calculateHeading(newCoords, routeCoordinates);
          }
        }
      );
    };

    startTracking();
    return () => { if (locationSubscription) locationSubscription.remove(); };
  }, [showDirections, routeCoordinates]);
};