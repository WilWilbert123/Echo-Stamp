import { Image } from 'react-native';
import thisisit from "../../../../../config/config";
export const GOOGLE_API_KEY = thisisit;
const noImagePlaceholder = require('../../../../../../assets/images/echologowbg.png');
// Add radius options for nearby search
export const RADIUS_OPTIONS = [
    { id: 'ultra_close', name: 'Ultra Close', meters: 50, label: '50m' },
    { id: 'very_close', name: 'Very Close', meters: 100, label: '100m' },
    { id: 'close', name: 'Close', meters: 200, label: '200m' },
    { id: 'medium_close', name: 'Medium Close', meters: 500, label: '500m' },
    { id: 'medium', name: 'Medium', meters: 1000, label: '1km' },
    { id: 'far', name: 'Far', meters: 2000, label: '2km' },
    { id: 'very_far', name: 'Very Far', meters: 5000, label: '5km' },
];

export const DEFAULT_RADIUS = RADIUS_OPTIONS[3]; // 500m default

export const CATEGORIES = [
    // ===== TRANSPORTATION & TRANSIT =====
    { id: '9', name: 'Parking Lots', icon: 'car', color: '#8B5CF6', type: 'parking', radius: 500 },
    { id: '10', name: 'Gas Stations', icon: 'flash', color: '#F97316', type: 'gas_station', radius: 2000 },

    // ===== GOVERNMENT & PUBLIC SERVICES =====
    { id: '12', name: 'City Hall', icon: 'business', color: '#3B82F6', type: 'city_hall', radius: 5000 },
    { id: '13', name: 'Barangay Hall', icon: 'home', color: '#10B981', type: 'local_government_office', radius: 2000 },
    { id: '14', name: 'Police Stations', icon: 'shield', color: '#1E3A8A', type: 'police', radius: 5000 },
    { id: '15', name: 'Fire Stations', icon: 'flame', color: '#EF4444', type: 'fire_station', radius: 5000 },
    { id: '16', name: 'Post Offices', icon: 'mail', color: '#F59E0B', type: 'post_office', radius: 3000 },

    // ===== HEALTH & EMERGENCY =====
    { id: '22', name: 'Hospitals', icon: 'medical', color: '#EF4444', type: 'hospital', radius: 5000 },
    { id: '23', name: 'Clinics', icon: 'medkit', color: '#10B981', type: 'doctor', radius: 2000 },
    { id: '24', name: 'Pharmacies', icon: 'medkit', color: '#F59E0B', type: 'pharmacy', radius: 1000 },
    { id: '25', name: 'Dentists', icon: 'happy', color: '#EC4899', type: 'dentist', radius: 2000 },
    { id: '26', name: 'Veterinarians', icon: 'paw', color: '#8B5CF6', type: 'veterinary_care', radius: 5000 },
    { id: '27', name: 'Optometrists', icon: 'eye', color: '#06B6D4', type: 'optician', radius: 5000 },

    // ===== EDUCATION =====
    { id: '31', name: 'Schools', icon: 'school', color: '#3B82F6', type: 'school', radius: 3000 },
    { id: '32', name: 'Universities', icon: 'business', color: '#6366F1', type: 'university', radius: 5000 },
    { id: '33', name: 'Libraries', icon: 'book', color: '#F59E0B', type: 'library', radius: 3000 },

    // ===== SHOPPING & RETAIL =====
    { id: '38', name: 'Malls', icon: 'cart', color: '#EC4899', type: 'shopping_mall', radius: 5000 },
    { id: '39', name: 'Supermarkets', icon: 'cart', color: '#10B981', type: 'supermarket', radius: 2000 },
    { id: '40', name: 'Convenience Stores', icon: 'storefront', color: '#F59E0B', type: 'convenience_store', radius: 500 },
    { id: '41', name: 'Bakeries', icon: 'restaurant', color: '#D97706', type: 'bakery', radius: 500 },
    { id: '45', name: 'Bookstores', icon: 'book', color: '#3B82F6', type: 'book_store', radius: 2000 },
    { id: '46', name: 'Electronics Stores', icon: 'phone-portrait', color: '#6366F1', type: 'electronics_store', radius: 5000 },
    { id: '47', name: 'Clothing Stores', icon: 'shirt', color: '#EC4899', type: 'clothing_store', radius: 2000 },
    { id: '48', name: 'Hardware Stores', icon: 'construct', color: '#F97316', type: 'hardware_store', radius: 5000 },
    { id: '49', name: 'Furniture Stores', icon: 'bed', color: '#8B5CF6', type: 'furniture_store', radius: 5000 },
    { id: '50', name: 'Pet Stores', icon: 'paw', color: '#10B981', type: 'pet_store', radius: 5000 },
    { id: '101', name: 'Florists', icon: 'rose', color: '#F43F5E', type: 'florist', radius: 3000 },
    { id: '102', name: 'Gift Shops', icon: 'gift', color: '#10B981', type: 'gift_shop', radius: 3000 },

    // ===== FOOD & DINING =====
    { id: '51', name: 'Restaurants', icon: 'restaurant', color: '#FB923C', type: 'restaurant', radius: 500 },
    { id: '52', name: 'Fast Food', icon: 'fast-food', color: '#EF4444', type: 'meal_takeaway', radius: 500 },
    { id: '53', name: 'Cafés', icon: 'cafe', color: '#A16207', type: 'cafe', radius: 300 },
    { id: '54', name: 'Bars/Pubs', icon: 'beer', color: '#F43F5E', type: 'bar', radius: 500 },

    // ===== ACCOMMODATION =====
    { id: '58', name: 'Hotels', icon: 'bed', color: '#60A5FA', type: 'lodging', radius: 1000 },

    // ===== FINANCIAL SERVICES =====
    { id: '64', name: 'Banks', icon: 'business', color: '#6366F1', type: 'bank', radius: 1000 },
    { id: '65', name: 'ATMs', icon: 'cash', color: '#F59E0B', type: 'atm', radius: 500 },

    // ===== ENTERTAINMENT & LEISURE =====
    { id: '70', name: 'Movie Theaters', icon: 'film', color: '#A855F7', type: 'movie_theater', radius: 3000 },
    { id: '74', name: 'Parks', icon: 'leaf', color: '#4ADE80', type: 'park', radius: 1000 },
    { id: '75', name: 'Museums', icon: 'color-palette', color: '#A855F7', type: 'museum', radius: 3000 },
    { id: '76', name: 'Art Galleries', icon: 'brush', color: '#EC4899', type: 'art_gallery', radius: 3000 },
    { id: '80', name: 'Gyms', icon: 'fitness', color: '#EF4444', type: 'gym', radius: 2000 },
    { id: '81', name: 'Spas', icon: 'water', color: '#EC4899', type: 'spa', radius: 2000 },
    { id: '82', name: 'Salons', icon: 'cut', color: '#F59E0B', type: 'hair_care', radius: 1000 },
    { id: '83', name: 'Barbershops', icon: 'cut', color: '#3B82F6', type: 'barber_shop', radius: 1000 },

    // ===== RELIGIOUS PLACES =====
    { id: '84', name: 'Churches', icon: 'bulb', color: '#8B5CF6', type: 'church', radius: 3000 },
    { id: '85', name: 'Mosques', icon: 'star', color: '#10B981', type: 'mosque', radius: 5000 },
    { id: '86', name: 'Temples', icon: 'home', color: '#F59E0B', type: 'hindu_temple', radius: 5000 },

    // ===== PERSONAL SERVICES =====
    { id: '94', name: 'Laundromats', icon: 'water', color: '#06B6D4', type: 'laundry', radius: 1000 },
    { id: '95', name: 'Dry Cleaners', icon: 'shirt', color: '#8B5CF6', type: 'dry_cleaner', radius: 2000 },

    // ===== AUTOMOTIVE SERVICES =====
    { id: '107', name: 'Car Washes', icon: 'car', color: '#06B6D4', type: 'car_wash', radius: 2000 },
    { id: '108', name: 'Auto Repair', icon: 'construct', color: '#F97316', type: 'car_repair', radius: 3000 },
];

export const QUICK_ACCESS_CATEGORIES = [
    { id: 'quick_1', name: 'Restaurants', icon: 'restaurant', color: '#FB923C', type: 'restaurant', radius: 500 },
    { id: 'quick_2', name: 'Cafés', icon: 'cafe', color: '#A16207', type: 'cafe', radius: 300 },
    { id: 'quick_3', name: 'ATMs', icon: 'cash', color: '#F59E0B', type: 'atm', radius: 500 },
    { id: 'quick_4', name: 'Gas Stations', icon: 'flash', color: '#F97316', type: 'gas_station', radius: 2000 },
    { id: 'quick_5', name: 'Hospitals', icon: 'medical', color: '#EF4444', type: 'hospital', radius: 5000 },
    { id: 'quick_6', name: 'Police', icon: 'shield', color: '#1E3A8A', type: 'police', radius: 5000 },
    { id: 'quick_7', name: 'Parks', icon: 'leaf', color: '#4ADE80', type: 'park', radius: 1000 },
];

// Category Groups (for the category group pills)
export const CATEGORY_GROUPS = [
    {
        id: 'group_1',
        name: 'Transportation',
        icon: 'car',
        color: '#3B82F6',
        categories: CATEGORIES.filter(cat =>
            ['Parking Lots', 'Gas Stations'].includes(cat.name)
        )
    },
    {
        id: 'group_2',
        name: 'Government',
        icon: 'business',
        color: '#10B981',
        categories: CATEGORIES.filter(cat =>
            ['City Hall', 'Barangay Hall', 'Police Stations', 'Fire Stations', 'Post Offices'].includes(cat.name)
        )
    },
    {
        id: 'group_3',
        name: 'Health',
        icon: 'medical',
        color: '#EF4444',
        categories: CATEGORIES.filter(cat =>
            ['Hospitals', 'Clinics', 'Pharmacies', 'Dentists', 'Veterinarians', 'Optometrists'].includes(cat.name)
        )
    },
    {
        id: 'group_4',
        name: 'Education',
        icon: 'school',
        color: '#6366F1',
        categories: CATEGORIES.filter(cat =>
            ['Schools', 'Universities', 'Libraries'].includes(cat.name)
        )
    },
    {
        id: 'group_5',
        name: 'Shopping',
        icon: 'cart',
        color: '#EC4899',
        categories: CATEGORIES.filter(cat =>
            ['Malls', 'Supermarkets', 'Convenience Stores', 'Bakeries', 'Bookstores', 'Electronics Stores', 'Clothing Stores', 'Hardware Stores', 'Furniture Stores', 'Pet Stores', 'Florists', 'Gift Shops'].includes(cat.name)
        )
    },
    {
        id: 'group_6',
        name: 'Food & Drink',
        icon: 'restaurant',
        color: '#FB923C',
        categories: CATEGORIES.filter(cat =>
            ['Restaurants', 'Fast Food', 'Cafés', 'Bars/Pubs'].includes(cat.name)
        )
    },
    {
        id: 'group_7',
        name: 'Entertainment',
        icon: 'film',
        color: '#A855F7',
        categories: CATEGORIES.filter(cat =>
            ['Movie Theaters', 'Parks', 'Museums', 'Art Galleries', 'Gyms', 'Spas', 'Salons', 'Barbershops'].includes(cat.name)
        )
    },
    {
        id: 'group_8',
        name: 'Religious',
        icon: 'star',
        color: '#8B5CF6',
        categories: CATEGORIES.filter(cat =>
            ['Churches', 'Mosques', 'Temples'].includes(cat.name)
        )
    },
    {
        id: 'group_9',
        name: 'Services',
        icon: 'water',
        color: '#06B6D4',
        categories: CATEGORIES.filter(cat =>
            ['Laundromats', 'Dry Cleaners', 'Car Washes', 'Auto Repair'].includes(cat.name)
        )
    },
    {
        id: 'group_10',
        name: 'Accommodation',
        icon: 'bed',
        color: '#60A5FA',
        categories: CATEGORIES.filter(cat =>
            ['Hotels'].includes(cat.name)
        )
    },
    {
        id: 'group_11',
        name: 'Financial',
        icon: 'business',
        color: '#6366F1',
        categories: CATEGORIES.filter(cat =>
            ['Banks', 'ATMs'].includes(cat.name)
        )
    },
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
const noImageUri = Image.resolveAssetSource(noImagePlaceholder).uri;
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
            : noImageUri,
        categoryIcon: icon,
        categoryColor: color,
    }));
};

// Helper function to calculate distance between two points in meters
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Add radius selector component helper
export const getRadiusForCategory = (category) => {
    return category?.radius || DEFAULT_RADIUS.meters;
};

export const KEYWORD_MAPPING = {
    // Transportation
    'parking': 'parking',
    'gas station': 'gas_station',

    // Government
    'city hall': 'city_hall',
    'barangay': 'local_government_office',
    'police': 'police',
    'fire': 'fire_station',
    'post office': 'post_office',

    // Health
    'hospital': 'hospital',
    'clinic': 'doctor',
    'doctor': 'doctor',
    'pharmacy': 'pharmacy',
    'drugstore': 'pharmacy',
    'dentist': 'dentist',
    'vet': 'veterinary_care',
    'veterinary': 'veterinary_care',
    'eye doctor': 'optician',

    // Education
    'school': 'school',
    'university': 'university',
    'college': 'university',
    'library': 'library',

    // Shopping
    'mall': 'shopping_mall',
    'supermarket': 'supermarket',
    'grocery': 'supermarket',
    'convenience store': 'convenience_store',
    'bakery': 'bakery',
    'bookstore': 'book_store',
    'electronics': 'electronics_store',
    'clothing': 'clothing_store',
    'hardware': 'hardware_store',
    'furniture': 'furniture_store',
    'pet store': 'pet_store',
    'florist': 'florist',
    'gift shop': 'gift_shop',

    // Food
    'restaurant': 'restaurant',
    'food': 'restaurant',
    'cafe': 'cafe',
    'coffee': 'cafe',
    'bar': 'bar',
    'pub': 'bar',
    'fast food': 'meal_takeaway',

    // Accommodation
    'hotel': 'lodging',

    // Financial
    'bank': 'bank',
    'atm': 'atm',

    // Entertainment
    'movie': 'movie_theater',
    'cinema': 'movie_theater',
    'park': 'park',
    'museum': 'museum',
    'art gallery': 'art_gallery',
    'gym': 'gym',
    'spa': 'spa',
    'salon': 'hair_care',
    'barbershop': 'barber_shop',

    // Religious
    'church': 'church',
    'mosque': 'mosque',
    'temple': 'hindu_temple',

    // Services
    'laundry': 'laundry',
    'dry clean': 'dry_cleaner',

    // Automotive
    'car wash': 'car_wash',
    'auto repair': 'car_repair',
};

export const getCategoryFromKeyword = (keyword) => {
    const lowerKeyword = keyword.toLowerCase().trim();
    const categoryType = KEYWORD_MAPPING[lowerKeyword];
    if (categoryType) {
        return CATEGORIES.find(cat => cat.type === categoryType);
    }
    return null;
};

// Helper function to get categories by type
export const getCategoriesByType = (type) => {
    return CATEGORIES.filter(cat => cat.type === type);
};

// Helper function to get popular/frequently used categories
export const POPULAR_CATEGORIES = CATEGORIES.filter(cat =>
    ['Police Stations', 'Hospitals', 'Pharmacies', 'Restaurants',
        'ATMs', 'Gas Stations', 'Supermarkets', 'Barangay Hall', 'Schools'].includes(cat.name)
);

// Helper function to get emergency categories
export const EMERGENCY_CATEGORIES = CATEGORIES.filter(cat =>
    ['Hospitals', 'Police Stations', 'Fire Stations', 'Pharmacies', 'Clinics'].includes(cat.name)
);