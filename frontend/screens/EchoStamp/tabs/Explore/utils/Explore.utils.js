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
    // ADD THESE NEW CATEGORIES:
    { id: '9', name: 'Grocery', icon: 'cart', color: '#EC4899', type: 'grocery_or_supermarket' },
    { id: '10', name: 'Pharmacy', icon: 'medical', color: '#10B981', type: 'pharmacy' },
    { id: '11', name: 'Hospitals', icon: 'medical', color: '#EF4444', type: 'hospital' },
    { id: '12', name: 'ATMs', icon: 'cash', color: '#F59E0B', type: 'atm' },
    { id: '13', name: 'Banks', icon: 'business', color: '#6366F1', type: 'bank' },
    { id: '14', name: 'Gas Stations', icon: 'car', color: '#F97316', type: 'gas_station' }, // NEW
    { id: '15', name: 'Parking', icon: 'car', color: '#8B5CF6', type: 'parking' }, // NEW
    { id: '16', name: 'Spas', icon: 'water', color: '#EC4899', type: 'spa' }, // NEW
    { id: '17', name: 'Gyms', icon: 'fitness', color: '#EF4444', type: 'gym' }, // NEW
    { id: '18', name: 'Libraries', icon: 'book', color: '#3B82F6', type: 'library' }, // NEW
    { id: '19', name: 'Movie Theaters', icon: 'film', color: '#A855F7', type: 'movie_theater' }, // NEW
    { id: '20', name: 'Bakeries', icon: 'restaurant', color: '#D97706', type: 'bakery' }, // NEW
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

// OPTIONAL: Add keyword mapping for search autocomplete/synonyms
export const KEYWORD_MAPPING = {
    'cafe': 'cafe',
    'cafes': 'cafe', 
    'coffee': 'cafe',
    'coffee shop': 'cafe',
    'restaurant': 'restaurant',
    'restaurants': 'restaurant',
    'food': 'restaurant',
    'dining': 'restaurant',
    'hotel': 'lodging',
    'hotels': 'lodging',
    'motel': 'lodging',
    'park': 'park',
    'parks': 'park',
    'nature': 'park',
    'garden': 'park',
    'museum': 'museum',
    'museums': 'museum',
    'art': 'museum',
    'gallery': 'museum',
    'mall': 'shopping_mall',
    'malls': 'shopping_mall',
    'shopping': 'shopping_mall',
    'store': 'shopping_mall',
    'bar': 'bar',
    'bars': 'bar',
    'pub': 'bar',
    'nightlife': 'bar',
    'grocery': 'grocery_or_supermarket',
    'supermarket': 'grocery_or_supermarket',
    'pharmacy': 'pharmacy',
    'drugstore': 'pharmacy',
    'hospital': 'hospital',
    'clinic': 'hospital',
    'atm': 'atm',
    'bank': 'bank',
    'gas': 'gas_station',
    'parking': 'parking',
    'spa': 'spa',
    'gym': 'gym',
    'library': 'library',
    'movie': 'movie_theater',
    'cinema': 'movie_theater',
    'bakery': 'bakery'
};

// Helper function to get category type from search keyword
export const getCategoryFromKeyword = (keyword) => {
    const lowerKeyword = keyword.toLowerCase().trim();
    const categoryType = KEYWORD_MAPPING[lowerKeyword];
    if (categoryType) {
        return CATEGORIES.find(cat => cat.type === categoryType);
    }
    return null;
};