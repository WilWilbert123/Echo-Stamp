const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withJetifier(config) {
  return withGradleProperties(config, async (config) => {
    config.modResults = await ensureJetifierEnabled(config.modResults);
    return config;
  });
};

async function ensureJetifierEnabled(gradleProperties) {
  // Add jetifier property if not present
  const jetifierProperty = {
    type: 'property',
    key: 'android.enableJetifier',
    value: 'true',
  };
  
  const useAndroidXProperty = {
    type: 'property',
    key: 'android.useAndroidX',
    value: 'true',
  };
  
  // Check if properties already exist
  const hasJetifier = gradleProperties.some(
    prop => prop.type === 'property' && prop.key === 'android.enableJetifier'
  );
  
  const hasAndroidX = gradleProperties.some(
    prop => prop.type === 'property' && prop.key === 'android.useAndroidX'
  );
  
  if (!hasJetifier) {
    gradleProperties.push(jetifierProperty);
  }
  
  if (!hasAndroidX) {
    gradleProperties.push(useAndroidXProperty);
  }
  
  return gradleProperties;
}