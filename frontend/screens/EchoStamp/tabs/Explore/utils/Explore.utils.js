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
    { id: '1', name: 'Bus Stations', icon: 'bus', color: '#3B82F6', type: 'bus_station', radius: 5000 },
    { id: '2', name: 'Train Stations', icon: 'train', color: '#6366F1', type: 'train_station', radius: 5000 },
    { id: '3', name: 'Airports', icon: 'airplane', color: '#8B5CF6', type: 'airport', radius: 10000 },
    { id: '4', name: 'Ferry Terminals', icon: 'boat', color: '#06B6D4', type: 'ferry_terminal', radius: 5000 },
    { id: '5', name: 'Taxi Stands', icon: 'car', color: '#F59E0B', type: 'taxi_stand', radius: 1000 },
    { id: '6', name: 'Subway/MRT Stations', icon: 'subway', color: '#EF4444', type: 'subway_station', radius: 3000 },
    { id: '7', name: 'Bike Rentals', icon: 'bicycle', color: '#10B981', type: 'bicycle_rental', radius: 2000 },
    { id: '8', name: 'Car Rentals', icon: 'car-sport', color: '#F97316', type: 'car_rental', radius: 5000 },
    { id: '9', name: 'Parking Lots', icon: 'car', color: '#8B5CF6', type: 'parking', radius: 500 },
    { id: '10', name: 'Gas Stations', icon: 'flash', color: '#F97316', type: 'gas_station', radius: 2000 },
    { id: '11', name: 'EV Charging Stations', icon: 'battery-charging', color: '#10B981', type: 'electric_vehicle_charging_station', radius: 5000 },

    // ===== GOVERNMENT & PUBLIC SERVICES =====
    { id: '12', name: 'City Hall', icon: 'business', color: '#3B82F6', type: 'city_hall', radius: 5000 },
    { id: '13', name: 'Barangay Hall', icon: 'home', color: '#10B981', type: 'local_government_office', radius: 2000 },
    { id: '14', name: 'Police Stations', icon: 'shield', color: '#1E3A8A', type: 'police', radius: 5000 },
    { id: '15', name: 'Fire Stations', icon: 'flame', color: '#EF4444', type: 'fire_station', radius: 5000 },
    { id: '16', name: 'Post Offices', icon: 'mail', color: '#F59E0B', type: 'post_office', radius: 3000 },
    { id: '17', name: 'BIR/Civil Registry', icon: 'document-text', color: '#6366F1', type: 'government_office', radius: 5000 },
    { id: '18', name: 'SSS/GSIS Offices', icon: 'people', color: '#EC4899', type: 'social_insurance_agency', radius: 5000 },
    { id: '19', name: 'DMV/LTO Offices', icon: 'car', color: '#F97316', type: 'dmv', radius: 5000 },
    { id: '20', name: 'Court Houses', icon: 'scale', color: '#8B5CF6', type: 'courthouse', radius: 5000 },
    { id: '21', name: 'Embassies', icon: 'flag', color: '#3B82F6', type: 'embassy', radius: 5000 },

    // ===== HEALTH & EMERGENCY =====
    { id: '22', name: 'Hospitals', icon: 'medical', color: '#EF4444', type: 'hospital', radius: 5000 },
    { id: '23', name: 'Clinics', icon: 'medkit', color: '#10B981', type: 'doctor', radius: 2000 },
    { id: '24', name: 'Pharmacies', icon: 'medkit', color: '#F59E0B', type: 'pharmacy', radius: 1000 },
    { id: '25', name: 'Dentists', icon: 'happy', color: '#EC4899', type: 'dentist', radius: 2000 },
    { id: '26', name: 'Veterinarians', icon: 'paw', color: '#8B5CF6', type: 'veterinary_care', radius: 5000 },
    { id: '27', name: 'Optometrists', icon: 'eye', color: '#06B6D4', type: 'optician', radius: 5000 },
    { id: '28', name: 'Blood Banks', icon: 'water', color: '#EF4444', type: 'blood_bank', radius: 10000 },
    { id: '29', name: 'Mental Health Centers', icon: 'heart', color: '#EC4899', type: 'psychiatrist', radius: 10000 },
    { id: '30', name: 'Rehab Centers', icon: 'fitness', color: '#10B981', type: 'physiotherapist', radius: 10000 },

    // ===== EDUCATION =====
    { id: '31', name: 'Schools', icon: 'school', color: '#3B82F6', type: 'school', radius: 3000 },
    { id: '32', name: 'Universities', icon: 'business', color: '#6366F1', type: 'university', radius: 5000 },
    { id: '33', name: 'Libraries', icon: 'book', color: '#F59E0B', type: 'library', radius: 3000 },
    { id: '34', name: 'Daycares', icon: 'happy', color: '#EC4899', type: 'day_care', radius: 2000 },
    { id: '35', name: 'Tutoring Centers', icon: 'bulb', color: '#10B981', type: 'school', radius: 3000 },
    { id: '36', name: 'Driving Schools', icon: 'car', color: '#F97316', type: 'driving_school', radius: 5000 },
    { id: '37', name: 'Language Schools', icon: 'chatbubbles', color: '#8B5CF6', type: 'school', radius: 5000 },

    // ===== SHOPPING & RETAIL =====
    { id: '38', name: 'Malls', icon: 'cart', color: '#EC4899', type: 'shopping_mall', radius: 5000 },
    { id: '39', name: 'Supermarkets', icon: 'cart', color: '#10B981', type: 'supermarket', radius: 2000 },
    { id: '40', name: 'Convenience Stores', icon: 'storefront', color: '#F59E0B', type: 'convenience_store', radius: 500 },
    { id: '41', name: 'Bakeries', icon: 'restaurant', color: '#D97706', type: 'bakery', radius: 500 },
    { id: '42', name: 'Butcher Shops', icon: 'restaurant', color: '#EF4444', type: 'butcher', radius: 2000 },
    { id: '43', name: 'Fish Markets', icon: 'fish', color: '#06B6D4', type: 'fish_market', radius: 2000 },
    { id: '44', name: 'Farmers Markets', icon: 'leaf', color: '#4ADE80', type: 'farmers_market', radius: 5000 },
    { id: '45', name: 'Bookstores', icon: 'book', color: '#3B82F6', type: 'book_store', radius: 2000 },
    { id: '46', name: 'Electronics Stores', icon: 'phone-portrait', color: '#6366F1', type: 'electronics_store', radius: 5000 },
    { id: '47', name: 'Clothing Stores', icon: 'shirt', color: '#EC4899', type: 'clothing_store', radius: 2000 },
    { id: '48', name: 'Hardware Stores', icon: 'construct', color: '#F97316', type: 'hardware_store', radius: 5000 },
    { id: '49', name: 'Furniture Stores', icon: 'bed', color: '#8B5CF6', type: 'furniture_store', radius: 5000 },
    { id: '50', name: 'Pet Stores', icon: 'paw', color: '#10B981', type: 'pet_store', radius: 5000 },

    // ===== FOOD & DINING =====
    { id: '51', name: 'Restaurants', icon: 'restaurant', color: '#FB923C', type: 'restaurant', radius: 500 },
    { id: '52', name: 'Fast Food', icon: 'fast-food', color: '#EF4444', type: 'meal_takeaway', radius: 500 },
    { id: '53', name: 'Cafés', icon: 'cafe', color: '#A16207', type: 'cafe', radius: 300 },
    { id: '54', name: 'Bars/Pubs', icon: 'beer', color: '#F43F5E', type: 'bar', radius: 500 },
    { id: '55', name: 'Nightclubs', icon: 'musical-notes', color: '#EC4899', type: 'night_club', radius: 1000 },
    { id: '56', name: 'Food Courts', icon: 'restaurant', color: '#F59E0B', type: 'food', radius: 1000 },
    { id: '57', name: 'Street Food', icon: 'restaurant', color: '#F97316', type: 'street_address', radius: 200 },

    // ===== ACCOMMODATION =====
    { id: '58', name: 'Hotels', icon: 'bed', color: '#60A5FA', type: 'lodging', radius: 1000 },
    { id: '59', name: 'Motels', icon: 'car', color: '#8B5CF6', type: 'motel', radius: 2000 },
    { id: '60', name: 'Hostels', icon: 'people', color: '#10B981', type: 'hostel', radius: 3000 },
    { id: '61', name: 'Resorts', icon: 'umbrella', color: '#06B6D4', type: 'resort', radius: 5000 },
    { id: '62', name: 'Bed & Breakfast', icon: 'home', color: '#F59E0B', type: 'bed_and_breakfast', radius: 3000 },
    { id: '63', name: 'Campgrounds', icon: 'campground', color: '#4ADE80', type: 'campground', radius: 5000 },

    // ===== FINANCIAL SERVICES =====
    { id: '64', name: 'Banks', icon: 'business', color: '#6366F1', type: 'bank', radius: 1000 },
    { id: '65', name: 'ATMs', icon: 'cash', color: '#F59E0B', type: 'atm', radius: 500 },
    { id: '66', name: 'Money Changers', icon: 'swap', color: '#10B981', type: 'currency_exchange', radius: 2000 },
    { id: '67', name: 'Pawnshops', icon: 'diamond', color: '#EC4899', type: 'pawn_shop', radius: 1000 },
    { id: '68', name: 'Remittance Centers', icon: 'send', color: '#3B82F6', type: 'money_transfer', radius: 2000 },
    { id: '69', name: 'Insurance Offices', icon: 'shield', color: '#8B5CF6', type: 'insurance_agency', radius: 5000 },

    // ===== ENTERTAINMENT & LEISURE =====
    { id: '70', name: 'Movie Theaters', icon: 'film', color: '#A855F7', type: 'movie_theater', radius: 3000 },
    { id: '71', name: 'Bowling Alleys', icon: 'bowling-ball', color: '#F59E0B', type: 'bowling_alley', radius: 5000 },
    { id: '72', name: 'Arcades', icon: 'game-controller', color: '#EC4899', type: 'amusement_center', radius: 5000 },
    { id: '73', name: 'Casinos', icon: 'dice', color: '#EF4444', type: 'casino', radius: 5000 },
    { id: '74', name: 'Parks', icon: 'leaf', color: '#4ADE80', type: 'park', radius: 1000 },
    { id: '75', name: 'Museums', icon: 'color-palette', color: '#A855F7', type: 'museum', radius: 3000 },
    { id: '76', name: 'Art Galleries', icon: 'brush', color: '#EC4899', type: 'art_gallery', radius: 3000 },
    { id: '77', name: 'Zoos', icon: 'paw', color: '#10B981', type: 'zoo', radius: 5000 },
    { id: '78', name: 'Aquariums', icon: 'water', color: '#06B6D4', type: 'aquarium', radius: 5000 },
    { id: '79', name: 'Stadiums', icon: 'trophy', color: '#F97316', type: 'stadium', radius: 5000 },
    { id: '80', name: 'Gyms', icon: 'fitness', color: '#EF4444', type: 'gym', radius: 2000 },
    { id: '81', name: 'Spas', icon: 'water', color: '#EC4899', type: 'spa', radius: 2000 },
    { id: '82', name: 'Salons', icon: 'cut', color: '#F59E0B', type: 'hair_care', radius: 1000 },
    { id: '83', name: 'Barbershops', icon: 'cut', color: '#3B82F6', type: 'barber_shop', radius: 1000 },

    // ===== RELIGIOUS PLACES =====
    { id: '84', name: 'Churches', icon: 'church', color: '#8B5CF6', type: 'church', radius: 3000 },
    { id: '85', name: 'Mosques', icon: 'star', color: '#10B981', type: 'mosque', radius: 5000 },
    { id: '86', name: 'Temples', icon: 'ribbon', color: '#F59E0B', type: 'hindu_temple', radius: 5000 },
    { id: '87', name: 'Cathedrals', icon: 'church', color: '#6366F1', type: 'church', radius: 5000 },
    { id: '88', name: 'Cemeteries', icon: 'rose', color: '#6B7280', type: 'cemetery', radius: 5000 },

    // ===== BUSINESS & OFFICES =====
    { id: '89', name: 'Coworking Spaces', icon: 'laptop', color: '#3B82F6', type: 'coworking_space', radius: 2000 },
    { id: '90', name: 'Business Centers', icon: 'briefcase', color: '#6366F1', type: 'business_park', radius: 3000 },
    { id: '91', name: 'Convention Centers', icon: 'people', color: '#EC4899', type: 'convention_center', radius: 5000 },
    { id: '92', name: 'Print Shops', icon: 'print', color: '#F59E0B', type: 'printing_services', radius: 2000 },
    { id: '93', name: 'Internet Cafés', icon: 'wifi', color: '#10B981', type: 'internet_cafe', radius: 1000 },

    // ===== PERSONAL SERVICES =====
    { id: '94', name: 'Laundromats', icon: 'water', color: '#06B6D4', type: 'laundry', radius: 1000 },
    { id: '95', name: 'Dry Cleaners', icon: 'shirt', color: '#8B5CF6', type: 'dry_cleaner', radius: 2000 },
    { id: '96', name: 'Tailors', icon: 'cut', color: '#EC4899', type: 'tailor', radius: 2000 },
    { id: '97', name: 'Shoe Repairs', icon: 'footsteps', color: '#F97316', type: 'shoe_repair', radius: 2000 },
    { id: '98', name: 'Key Makers', icon: 'key', color: '#F59E0B', type: 'locksmith', radius: 2000 },
    { id: '99', name: 'Phone Repair', icon: 'phone-portrait', color: '#3B82F6', type: 'cell_phone_store', radius: 2000 },
    { id: '100', name: 'Photographers', icon: 'camera', color: '#EC4899', type: 'photographer', radius: 5000 },
    { id: '101', name: 'Florists', icon: 'rose', color: '#F43F5E', type: 'florist', radius: 3000 },
    { id: '102', name: 'Gift Shops', icon: 'gift', color: '#10B981', type: 'gift_shop', radius: 3000 },
    { id: '103', name: 'Tattoo Shops', icon: 'brush', color: '#8B5CF6', type: 'tattoo', radius: 3000 },

    // ===== REAL ESTATE =====
    { id: '104', name: 'Real Estate Agents', icon: 'home', color: '#3B82F6', type: 'real_estate_agency', radius: 5000 },
    { id: '105', name: 'Apartment Rentals', icon: 'business', color: '#6366F1', type: 'apartment_rental', radius: 3000 },
    { id: '106', name: 'Property Management', icon: 'briefcase', color: '#10B981', type: 'property_management', radius: 5000 },

    // ===== AUTOMOTIVE SERVICES =====
    { id: '107', name: 'Car Washes', icon: 'car', color: '#06B6D4', type: 'car_wash', radius: 2000 },
    { id: '108', name: 'Auto Repair', icon: 'construct', color: '#F97316', type: 'car_repair', radius: 3000 },
    { id: '109', name: 'Tire Shops', icon: 'car', color: '#8B5CF6', type: 'car_dealer', radius: 5000 },
    { id: '110', name: 'Auto Parts Stores', icon: 'car', color: '#F59E0B', type: 'auto_parts_store', radius: 5000 },
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
            ['Bus Stations', 'Train Stations', 'Airports', 'Ferry Terminals', 'Taxi Stands', 'Subway/MRT Stations', 'Bike Rentals', 'Car Rentals', 'Parking Lots', 'Gas Stations', 'EV Charging Stations'].includes(cat.name)
        )
    },
    { 
        id: 'group_2', 
        name: 'Government', 
        icon: 'business', 
        color: '#10B981',
        categories: CATEGORIES.filter(cat => 
            ['City Hall', 'Barangay Hall', 'Police Stations', 'Fire Stations', 'Post Offices', 'BIR/Civil Registry', 'SSS/GSIS Offices', 'DMV/LTO Offices', 'Court Houses', 'Embassies'].includes(cat.name)
        )
    },
    { 
        id: 'group_3', 
        name: 'Health', 
        icon: 'medical', 
        color: '#EF4444',
        categories: CATEGORIES.filter(cat => 
            ['Hospitals', 'Clinics', 'Pharmacies', 'Dentists', 'Veterinarians', 'Optometrists', 'Blood Banks', 'Mental Health Centers', 'Rehab Centers'].includes(cat.name)
        )
    },
    { 
        id: 'group_4', 
        name: 'Education', 
        icon: 'school', 
        color: '#6366F1',
        categories: CATEGORIES.filter(cat => 
            ['Schools', 'Universities', 'Libraries', 'Daycares', 'Tutoring Centers', 'Driving Schools', 'Language Schools'].includes(cat.name)
        )
    },
    { 
        id: 'group_5', 
        name: 'Shopping', 
        icon: 'cart', 
        color: '#EC4899',
        categories: CATEGORIES.filter(cat => 
            ['Malls', 'Supermarkets', 'Convenience Stores', 'Bakeries', 'Butcher Shops', 'Fish Markets', 'Farmers Markets', 'Bookstores', 'Electronics Stores', 'Clothing Stores', 'Hardware Stores', 'Furniture Stores', 'Pet Stores'].includes(cat.name)
        )
    },
    { 
        id: 'group_6', 
        name: 'Food & Drink', 
        icon: 'restaurant', 
        color: '#FB923C',
        categories: CATEGORIES.filter(cat => 
            ['Restaurants', 'Fast Food', 'Cafés', 'Bars/Pubs', 'Nightclubs', 'Food Courts', 'Street Food'].includes(cat.name)
        )
    },
    { 
        id: 'group_7', 
        name: 'Entertainment', 
        icon: 'film', 
        color: '#A855F7',
        categories: CATEGORIES.filter(cat => 
            ['Movie Theaters', 'Bowling Alleys', 'Arcades', 'Casinos', 'Parks', 'Museums', 'Art Galleries', 'Zoos', 'Aquariums', 'Stadiums', 'Gyms', 'Spas', 'Salons', 'Barbershops'].includes(cat.name)
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
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// Add radius selector component helper
export const getRadiusForCategory = (category) => {
    return category?.radius || DEFAULT_RADIUS.meters;
};

export const KEYWORD_MAPPING = {
    // Transportation
    'bus': 'bus_station',
    'bus station': 'bus_station',
    'terminal': 'bus_station',
    'train': 'train_station',
    'railway': 'train_station',
    'airport': 'airport',
    'plane': 'airport',
    'ferry': 'ferry_terminal',
    'boat': 'ferry_terminal',
    'taxi': 'taxi_stand',
    'mrt': 'subway_station',
    'lrt': 'subway_station',
    'subway': 'subway_station',
    'bike rental': 'bicycle_rental',
    'car rental': 'car_rental',
    'ev charging': 'electric_vehicle_charging_station',
    'charging station': 'electric_vehicle_charging_station',
    
    // Government
    'city hall': 'city_hall',
    'barangay': 'local_government_office',
    'police': 'police',
    'fire': 'fire_station',
    'post office': 'post_office',
    'bir': 'government_office',
    'sss': 'social_insurance_agency',
    'gsis': 'social_insurance_agency',
    'lto': 'dmv',
    'court': 'courthouse',
    'embassy': 'embassy',
    
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
    'blood bank': 'blood_bank',
    'mental health': 'psychiatrist',
    
    // Education
    'school': 'school',
    'university': 'university',
    'college': 'university',
    'library': 'library',
    'daycare': 'day_care',
    'tutor': 'school',
    'driving school': 'driving_school',
    
    // Shopping
    'mall': 'shopping_mall',
    'supermarket': 'supermarket',
    'grocery': 'supermarket',
    'convenience store': 'convenience_store',
    'bakery': 'bakery',
    'butcher': 'butcher',
    'bookstore': 'book_store',
    'electronics': 'electronics_store',
    'clothing': 'clothing_store',
    'hardware': 'hardware_store',
    'furniture': 'furniture_store',
    'pet store': 'pet_store',
    
    // Food
    'restaurant': 'restaurant',
    'food': 'restaurant',
    'cafe': 'cafe',
    'coffee': 'cafe',
    'bar': 'bar',
    'pub': 'bar',
    'nightclub': 'night_club',
    'fast food': 'meal_takeaway',
    
    // Accommodation
    'hotel': 'lodging',
    'motel': 'motel',
    'hostel': 'hostel',
    'resort': 'resort',
    'camping': 'campground',
    
    // Financial
    'bank': 'bank',
    'atm': 'atm',
    'money changer': 'currency_exchange',
    'pawnshop': 'pawn_shop',
    'remittance': 'money_transfer',
    'insurance': 'insurance_agency',
    
    // Entertainment
    'movie': 'movie_theater',
    'cinema': 'movie_theater',
    'bowling': 'bowling_alley',
    'arcade': 'amusement_center',
    'park': 'park',
    'museum': 'museum',
    'art gallery': 'art_gallery',
    'zoo': 'zoo',
    'aquarium': 'aquarium',
    'stadium': 'stadium',
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
    'tailor': 'tailor',
    'phone repair': 'cell_phone_store',
    'florist': 'florist',
    'gift shop': 'gift_shop',
    'tattoo': 'tattoo',
    
    // Automotive
    'car wash': 'car_wash',
    'auto repair': 'car_repair',
    'gas station': 'gas_station',
    'parking': 'parking',
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
    ['Bus Stations', 'Police Stations', 'Hospitals', 'Pharmacies', 'Restaurants', 
     'ATMs', 'Gas Stations', 'Supermarkets', 'Barangay Hall', 'Schools'].includes(cat.name)
);

// Helper function to get emergency categories
export const EMERGENCY_CATEGORIES = CATEGORIES.filter(cat =>
    ['Hospitals', 'Police Stations', 'Fire Stations', 'Pharmacies', 'Clinics'].includes(cat.name)
);