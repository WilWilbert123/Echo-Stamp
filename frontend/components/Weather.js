import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Weather = ({ userLocation, colors }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { isDark } = useTheme();
  const cachedWeather = useRef(null);
  const hasInitialFetch = useRef(false);

  // Map weather conditions to Lottie animations
  const getWeatherAnimation = (weatherId, isDay = true) => {
    if (weatherId >= 200 && weatherId < 300) {
      return require('../assets/Weatherstorm.json');
    }
    else if ((weatherId >= 300 && weatherId < 400) || (weatherId >= 500 && weatherId < 600)) {
      return require('../assets/Weathershower.json');
    }
    else if (weatherId >= 600 && weatherId < 700) {
      return require('../assets/Weathersnow.json');
    }
    else if (weatherId >= 700 && weatherId < 800) {
      return require('../assets/Weatherwindy.json');
    }
    else if (weatherId === 800) {
      return isDay ? require('../assets/sunny.json') : require('../assets/Weathernight.json');
    }
    else if (weatherId > 800 && weatherId < 805) {
      return require('../assets/Weathercloudy.json');
    }
    else {
      return require('../assets/Weathercloudy.json');
    }
  };

  const isDayTime = (sunrise, sunset, currentTime) => {
    return currentTime >= sunrise && currentTime <= sunset;
  };

  const fetchWeather = useCallback(async (lat, lon, showLoading = true) => {
    if (cachedWeather.current) {
      setWeatherData(cachedWeather.current);
      return;
    }
    
    if (showLoading) setLoading(true);
    
    try {
      const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || '19d044de41d3c81cbf1597a138f09ca3';
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
      );
      const data = await response.json();
      
      if (data.cod === 200) {
        cachedWeather.current = data;
        setWeatherData(data);
      } else {
        console.error('Weather API error:', data);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLocation && !hasInitialFetch.current) {
      hasInitialFetch.current = true;
      fetchWeather(userLocation.latitude, userLocation.longitude, false);
    }
  }, [userLocation, fetchWeather]);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
    
    if (cachedWeather.current) {
      setWeatherData(cachedWeather.current);
    } else if (userLocation) {
      fetchWeather(userLocation.latitude, userLocation.longitude, true);
    }
  }, [userLocation, fetchWeather]);

  const getWeatherDescription = useCallback((description) => {
    return description.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }, []);

  const formatTime = useCallback((timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const handleRetry = useCallback(() => {
    if (userLocation) {
      cachedWeather.current = null;
      fetchWeather(userLocation.latitude, userLocation.longitude, true);
    }
  }, [userLocation, fetchWeather]);

  const animationSource = weatherData ? getWeatherAnimation(
    weatherData.weather[0].id,
    isDayTime(weatherData.sys.sunrise, weatherData.sys.sunset, Math.floor(Date.now() / 1000))
  ) : null;

  return (
    <>
      {/* Weather FAB Button */}
      <TouchableOpacity
        style={[
          styles.weatherFab, 
          { 
            backgroundColor: colors.background[1], 
            borderColor: colors.glassBorder, 
            borderWidth: 1 
          }
        ]}
        onPress={handleOpenModal}
      >
        <LottieView
          source={require('../assets/Weathercloudy.json')}
          style={{ width: 32, height: 32 }}
          autoPlay
          loop
          speed={0.8}
        />
      </TouchableOpacity>

      {/* Weather Modal - No Scroll, Compact Design */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.weatherModalContent, 
            { 
              backgroundColor: colors.background[1], 
              borderColor: colors.glassBorder,
              borderWidth: 1
            }
          ]}>
            <TouchableOpacity 
              style={styles.weatherModalClose} 
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={26} color={colors.textSecondary} />
            </TouchableOpacity>

            {weatherData ? (
              <View style={styles.weatherContent}>
                {/* Lottie Animation Header - Smaller */}
                <View style={styles.weatherAnimationContainer}>
                  <LottieView
                    source={animationSource}
                    style={styles.weatherAnimation}
                    autoPlay
                    loop
                    speed={0.7}
                  />
                </View>

                {/* Location - Smaller */}
                <Text style={[styles.weatherLocation, { color: colors.textMain }]}>
                  {weatherData.name}, {weatherData.sys.country}
                </Text>

                {/* Temperature - Smaller */}
                <Text style={[styles.weatherTemp, { color: colors.textMain }]}>
                  {Math.round(weatherData.main.temp)}°C
                </Text>

                {/* Description */}
                <Text style={[styles.weatherDescription, { color: colors.primary }]}>
                  {getWeatherDescription(weatherData.weather[0].description)}
                </Text>

                {/* Details Grid - More Compact */}
                <View style={styles.weatherDetailsGrid}>
                  <View style={[styles.weatherDetailCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Ionicons name="thermometer-outline" size={18} color={colors.primary} />
                    <Text style={[styles.weatherDetailLabel, { color: colors.textSecondary }]}>Feels</Text>
                    <Text style={[styles.weatherDetailValue, { color: colors.textMain }]}>
                      {Math.round(weatherData.main.feels_like)}°
                    </Text>
                  </View>

                  <View style={[styles.weatherDetailCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Ionicons name="water-outline" size={18} color={colors.primary} />
                    <Text style={[styles.weatherDetailLabel, { color: colors.textSecondary }]}>Humidity</Text>
                    <Text style={[styles.weatherDetailValue, { color: colors.textMain }]}>
                      {weatherData.main.humidity}%
                    </Text>
                  </View>

                  <View style={[styles.weatherDetailCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Ionicons name="speedometer-outline" size={18} color={colors.primary} />
                    <Text style={[styles.weatherDetailLabel, { color: colors.textSecondary }]}>Wind</Text>
                    <Text style={[styles.weatherDetailValue, { color: colors.textMain }]}>
                      {Math.round(weatherData.wind.speed * 3.6)}
                    </Text>
                  </View>

                  <View style={[styles.weatherDetailCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Ionicons name="compass-outline" size={18} color={colors.primary} />
                    <Text style={[styles.weatherDetailLabel, { color: colors.textSecondary }]}>Pressure</Text>
                    <Text style={[styles.weatherDetailValue, { color: colors.textMain }]}>
                      {weatherData.main.pressure}
                    </Text>
                  </View>
                </View>

                {/* Visibility - Compact */}
                <View style={[styles.weatherVisibilityCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                  <Ionicons name="eye-outline" size={16} color={colors.primary} />
                  <Text style={[styles.weatherVisibilityText, { color: colors.textSecondary }]}>
                    Visibility: {(weatherData.visibility / 1000).toFixed(1)} km
                  </Text>
                </View>

                {/* Sun times - Compact */}
                <View style={styles.weatherSunContainer}>
                  <View style={styles.weatherSunItem}>
                    <Ionicons name="sunny-outline" size={16} color="#FFA500" />
                    <Text style={[styles.weatherSunText, { color: colors.textSecondary }]}>
                      Sunrise: {formatTime(weatherData.sys.sunrise)}
                    </Text>
                  </View>
                  <View style={styles.weatherSunItem}>
                    <Ionicons name="moon-outline" size={16} color="#6A5ACD" />
                    <Text style={[styles.weatherSunText, { color: colors.textSecondary }]}>
                      Sunset: {formatTime(weatherData.sys.sunset)}
                    </Text>
                  </View>
                </View>

                {/* Last updated - Very Small */}
                <Text style={[styles.weatherUpdated, { color: colors.textSecondary }]}>
                  Updated just now
                </Text>
              </View>
            ) : loading ? (
              <View style={styles.weatherLoadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.weatherLoadingText, { color: colors.textSecondary }]}>
                  Fetching weather...
                </Text>
              </View>
            ) : (
              <View style={styles.weatherErrorContainer}>
                <LottieView
                  source={require('../assets/Weathercloudy.json')}
                  style={{ width: 100, height: 100 }}
                  autoPlay
                  loop
                />
                <Text style={[styles.weatherErrorText, { color: colors.textSecondary }]}>
                  Unable to fetch weather data
                </Text>
                <TouchableOpacity 
                  onPress={handleRetry}
                  style={[styles.weatherRetryBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.weatherRetryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = {
  weatherFab: { 
    position: 'absolute', 
    left: 20, 
    top: 190,
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 11, 
    elevation: 6, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    
  },
  weatherModalContent: { 
    width: '90%', 
    padding: 20, 
    borderRadius: 30,
    paddingTop: 15,
    paddingBottom: 20
  },
  weatherModalClose: { 
    position: 'absolute', 
    top: 15, 
    right: 15, 
    zIndex: 10, 
    padding: 5 
  },
  weatherLoadingContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 30 
  },
  weatherLoadingText: { 
    marginTop: 15, 
    fontSize: 16, 
    fontWeight: '500' 
  },
  weatherContent: { 
    alignItems: 'center',
    marginTop: 5
  },
  weatherAnimationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  weatherAnimation: {
    width: 80,
    height: 80,
  },
  weatherLocation: { 
    fontSize: 18, 
    fontWeight: '800', 
    marginBottom: 3, 
    textAlign: 'center' 
  },
  weatherTemp: { 
    fontSize: 40, 
    fontWeight: 'bold',
    marginVertical: 2
  },
  weatherDescription: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 12 
  },
  weatherDetailsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginVertical: 8,
    width: '100%'
  },
  weatherDetailCard: { 
    width: '48%', 
    alignItems: 'center', 
    padding: 8, 
    borderRadius: 12, 
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  weatherDetailLabel: { 
    fontSize: 11, 
    fontWeight: '500',
    marginLeft: 5
  },
  weatherDetailValue: { 
    fontSize: 13, 
    fontWeight: '700',
    marginLeft: 5
  },
  weatherVisibilityCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 8, 
    borderRadius: 12, 
    marginVertical: 5, 
    width: '100%' 
  },
  weatherVisibilityText: { 
    marginLeft: 6, 
    fontSize: 12, 
    fontWeight: '500' 
  },
  weatherSunContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    paddingHorizontal: 15, 
    marginVertical: 8 
  },
  weatherSunItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5 
  },
  weatherSunText: { 
    fontSize: 11, 
    fontWeight: '500' 
  },
  weatherUpdated: { 
    fontSize: 9, 
    marginTop: 8, 
    marginBottom: 2,
    opacity: 0.6 
  },
  weatherErrorContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 30 
  },
  weatherErrorText: { 
    marginTop: 15, 
    fontSize: 16, 
    fontWeight: '500', 
    textAlign: 'center' 
  },
  weatherRetryBtn: { 
    marginTop: 20, 
    paddingHorizontal: 25, 
    paddingVertical: 10, 
    borderRadius: 20 
  },
  weatherRetryText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
};

export default Weather;