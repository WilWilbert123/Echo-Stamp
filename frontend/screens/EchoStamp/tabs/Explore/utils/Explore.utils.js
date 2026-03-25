import thisisit from "../../../../../config/config";

export const GOOGLE_API_KEY = thisisit;

export const CATEGORIES = [
    { id: '1', name: 'Cities', icon: 'business', color: '#94A3B8', type: 'locality' },
    { id: '2', name: 'Food', icon: 'restaurant', color: '#FB923C', type: 'restaurant' },
    { id: '3', name: 'Café', icon: 'cafe', color: '#A16207', type: 'cafe' },
    { id: '4', name: 'Hotels', icon: 'bed', color: '#60A5FA', type: 'lodging' },
    { id: '5', name: 'Nature', icon: 'leaf', color: '#4ADE80', type: 'park' },
    { id: '6', name: 'Museums', icon: 'color-palette', color: '#A855F7', type: 'museum' },
    { id: '7', name: 'Shopping', icon: 'cart', color: '#EC4899', type: 'shopping_mall' },
    { id: '8', name: 'Nightlife', icon: 'beer', color: '#F43F5E', type: 'bar' },
];

export const DARK_MAP_STYLE = [
    { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
    { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
    { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }] },
    { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#023e58" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d6a" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6f9ba5" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c6675" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#255763" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4e6d70" }] }
];

export const formatGoogleResults = (results, color, icon) => {
    return results.map(item => ({
        id: item.place_id,
        name: item.name,
        address: item.vicinity || item.formatted_address || "Address unavailable",
        lat: item.geometry.location.lat,
        lon: item.geometry.location.lng,
        rating: item.rating || 0,
        image: item.photos
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
            : `https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800`,
        categoryIcon: icon,
        categoryColor: color
    }));
};