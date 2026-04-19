import { Image } from 'react-native';
import thisisit from "../../../../../config/config";

const noImagePlaceholder = require('../../../../../../assets/images/echologowbg.png');
const noImageUri = Image.resolveAssetSource(noImagePlaceholder).uri;
export const GOOGLE_API_KEY = thisisit;

 
export const getEventImage = (coords) => {
  if (!coords?.latitude) return noImageUri;
  return `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${coords.latitude},${coords.longitude}&fov=90&heading=235&pitch=10&key=${GOOGLE_API_KEY}`;
};

export const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
  { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
  { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#023e58" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d6a" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] }
];