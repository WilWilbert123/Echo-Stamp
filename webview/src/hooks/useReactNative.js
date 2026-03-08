export const useReactNative = () => {
  const sendMessage = (type, payload = {}) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type, payload })
      );
    } else {
      console.warn("Native bridge not found. Operating in browser mode.");
    }
  };

  return { sendMessage };
};