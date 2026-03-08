import { useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../redux/authSlice'; // Ensure path is correct

const InsightWebView = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef(null);
  const dispatch = useDispatch();
  
  const { list } = useSelector((state) => state.echoes);
  const { user } = useSelector((state) => state.auth);

  // Injects data from Redux into the WebView window
  const injectedJS = `
    (function() {
      window.mobileData = ${JSON.stringify({ echoes: list, user: user })};
      window.dispatchEvent(new Event('mobileDataReady'));
    })();
    true; 
  `;
const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'AUTH_SUCCESS') {
        // Update Redux state with user data and token
        dispatch(setCredentials(data.payload));
        
        // Success feedback and transition
        Alert.alert("Success", "Authenticated with Echo Stamp!", [
          { text: "Continue", onPress: () => navigation.replace('MainTabs') }
        ]);
      }
    } catch (e) {
      console.error("WebView Message Error:", e);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WebView
        ref={webViewRef}
        // IMPORTANT: Use the /login route for the auth screen
        source={{ uri: 'https://echo-stamp.onrender.com/login' }} 
        injectedJavaScript={injectedJS}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onMessage={handleMessage}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#00f2fe" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  loader: { 
    position: 'absolute', 
    height: '100%', 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#050505' 
  }
});

export default InsightWebView;