import { GOOGLE_API_KEY } from '../screens/EchoStamp/tabs/Explore/utils/Explore.utils';

// Complete categories mapping based on supported Explore categories
export const AI_PLACE_CATEGORIES = {
    // ===== TRANSPORTATION =====
    'parking': { type: 'parking', name: 'Parking Lots', icon: 'car', color: '#8B5CF6', keyword: 'parking lot' },
    'parking lot': { type: 'parking', name: 'Parking Lots', icon: 'car', color: '#8B5CF6', keyword: 'parking lot' },
    'gas station': { type: 'gas_station', name: 'Gas Stations', icon: 'flash', color: '#F97316', keyword: 'gas station' },
    
    // ===== GOVERNMENT & PUBLIC SERVICES =====
    'city hall': { type: 'city_hall', name: 'City Hall', icon: 'business', color: '#3B82F6', keyword: 'city hall' },
    'barangay hall': { type: 'local_government_office', name: 'Barangay Hall', icon: 'home', color: '#10B981', keyword: 'barangay hall' },
    'barangay': { type: 'local_government_office', name: 'Barangay Hall', icon: 'home', color: '#10B981', keyword: 'barangay hall' },
    'police': { type: 'police', name: 'Police Stations', icon: 'shield', color: '#1E3A8A', keyword: 'police station' },
    'police station': { type: 'police', name: 'Police Stations', icon: 'shield', color: '#1E3A8A', keyword: 'police station' },
    'fire station': { type: 'fire_station', name: 'Fire Stations', icon: 'flame', color: '#EF4444', keyword: 'fire station' },
    'post office': { type: 'post_office', name: 'Post Offices', icon: 'mail', color: '#F59E0B', keyword: 'post office' },
    
    // ===== HEALTH & EMERGENCY =====
    'hospital': { type: 'hospital', name: 'Hospitals', icon: 'medical', color: '#EF4444', keyword: 'hospital' },
    'clinic': { type: 'doctor', name: 'Clinics', icon: 'medkit', color: '#10B981', keyword: 'medical clinic' },
    'pharmacy': { type: 'pharmacy', name: 'Pharmacies', icon: 'medkit', color: '#F59E0B', keyword: 'pharmacy' },
    'drugstore': { type: 'pharmacy', name: 'Pharmacies', icon: 'medkit', color: '#F59E0B', keyword: 'pharmacy' },
    'dentist': { type: 'dentist', name: 'Dentists', icon: 'happy', color: '#EC4899', keyword: 'dentist' },
    'vet': { type: 'veterinary_care', name: 'Veterinarians', icon: 'paw', color: '#8B5CF6', keyword: 'veterinarian' },
    'veterinary': { type: 'veterinary_care', name: 'Veterinarians', icon: 'paw', color: '#8B5CF6', keyword: 'veterinary clinic' },
    'optometrist': { type: 'optician', name: 'Optometrists', icon: 'eye', color: '#06B6D4', keyword: 'eye doctor' },
    'eye doctor': { type: 'optician', name: 'Optometrists', icon: 'eye', color: '#06B6D4', keyword: 'eye doctor' },
    
    // ===== EDUCATION =====
    'school': { type: 'school', name: 'Schools', icon: 'school', color: '#3B82F6', keyword: 'school' },
    'university': { type: 'university', name: 'Universities', icon: 'business', color: '#6366F1', keyword: 'university' },
    'college': { type: 'university', name: 'Universities', icon: 'business', color: '#6366F1', keyword: 'college' },
    'library': { type: 'library', name: 'Libraries', icon: 'book', color: '#F59E0B', keyword: 'library' },
    
    // ===== SHOPPING & RETAIL =====
    'mall': { type: 'shopping_mall', name: 'Malls', icon: 'cart', color: '#EC4899', keyword: 'shopping mall' },
    'shopping mall': { type: 'shopping_mall', name: 'Malls', icon: 'cart', color: '#EC4899', keyword: 'shopping mall' },
    'supermarket': { type: 'supermarket', name: 'Supermarkets', icon: 'cart', color: '#10B981', keyword: 'supermarket' },
    'grocery': { type: 'supermarket', name: 'Supermarkets', icon: 'cart', color: '#10B981', keyword: 'grocery store' },
    'convenience store': { type: 'convenience_store', name: 'Convenience Stores', icon: 'storefront', color: '#F59E0B', keyword: 'convenience store' },
    'bakery': { type: 'bakery', name: 'Bakeries', icon: 'restaurant', color: '#D97706', keyword: 'bakery' },
    'bookstore': { type: 'book_store', name: 'Bookstores', icon: 'book', color: '#3B82F6', keyword: 'bookstore' },
    'electronics store': { type: 'electronics_store', name: 'Electronics Stores', icon: 'phone-portrait', color: '#6366F1', keyword: 'electronics store' },
    'clothing store': { type: 'clothing_store', name: 'Clothing Stores', icon: 'shirt', color: '#EC4899', keyword: 'clothing store' },
    'hardware store': { type: 'hardware_store', name: 'Hardware Stores', icon: 'construct', color: '#F97316', keyword: 'hardware store' },
    'furniture store': { type: 'furniture_store', name: 'Furniture Stores', icon: 'bed', color: '#8B5CF6', keyword: 'furniture store' },
    'pet store': { type: 'pet_store', name: 'Pet Stores', icon: 'paw', color: '#10B981', keyword: 'pet store' },
    'florist': { type: 'florist', name: 'Florists', icon: 'rose', color: '#F43F5E', keyword: 'florist' },
    'gift shop': { type: 'gift_shop', name: 'Gift Shops', icon: 'gift', color: '#10B981', keyword: 'gift shop' },
    
    // ===== FOOD & DINING =====
    'restaurant': { type: 'restaurant', name: 'Restaurants', icon: 'restaurant', color: '#FB923C', keyword: 'restaurant' },
    'restaurants': { type: 'restaurant', name: 'Restaurants', icon: 'restaurant', color: '#FB923C', keyword: 'restaurant' },
    'food': { type: 'restaurant', name: 'Restaurants', icon: 'restaurant', color: '#FB923C', keyword: 'restaurant' },
    'fast food': { type: 'meal_takeaway', name: 'Fast Food', icon: 'fast-food', color: '#EF4444', keyword: 'fast food' },
    'fastfood': { type: 'meal_takeaway', name: 'Fast Food', icon: 'fast-food', color: '#EF4444', keyword: 'fast food' },
    'cafe': { type: 'cafe', name: 'Cafés', icon: 'cafe', color: '#A16207', keyword: 'cafe' },
    'cafes': { type: 'cafe', name: 'Cafés', icon: 'cafe', color: '#A16207', keyword: 'cafe' },
    'coffee': { type: 'cafe', name: 'Cafés', icon: 'cafe', color: '#A16207', keyword: 'coffee shop' },
    'coffee shop': { type: 'cafe', name: 'Cafés', icon: 'cafe', color: '#A16207', keyword: 'coffee shop' },
    'bar': { type: 'bar', name: 'Bars/Pubs', icon: 'beer', color: '#F43F5E', keyword: 'bar' },
    'pub': { type: 'bar', name: 'Bars/Pubs', icon: 'beer', color: '#F43F5E', keyword: 'pub' },
    
    // ===== ACCOMMODATION =====
    'hotel': { type: 'lodging', name: 'Hotels', icon: 'bed', color: '#60A5FA', keyword: 'hotel' },
    'hotels': { type: 'lodging', name: 'Hotels', icon: 'bed', color: '#60A5FA', keyword: 'hotel' },
    
    // ===== FINANCIAL SERVICES =====
    'bank': { type: 'bank', name: 'Banks', icon: 'business', color: '#6366F1', keyword: 'bank' },
    'atm': { type: 'atm', name: 'ATMs', icon: 'cash', color: '#F59E0B', keyword: 'atm' },
    
    // ===== ENTERTAINMENT & LEISURE =====
    'movie theater': { type: 'movie_theater', name: 'Movie Theaters', icon: 'film', color: '#A855F7', keyword: 'movie theater' },
    'cinema': { type: 'movie_theater', name: 'Movie Theaters', icon: 'film', color: '#A855F7', keyword: 'cinema' },
    'park': { type: 'park', name: 'Parks', icon: 'leaf', color: '#4ADE80', keyword: 'park' },
    'museum': { type: 'museum', name: 'Museums', icon: 'color-palette', color: '#A855F7', keyword: 'museum' },
    'art gallery': { type: 'art_gallery', name: 'Art Galleries', icon: 'brush', color: '#EC4899', keyword: 'art gallery' },
    'gym': { type: 'gym', name: 'Gyms', icon: 'fitness', color: '#EF4444', keyword: 'gym' },
    'fitness': { type: 'gym', name: 'Gyms', icon: 'fitness', color: '#EF4444', keyword: 'fitness center' },
    'spa': { type: 'spa', name: 'Spas', icon: 'water', color: '#EC4899', keyword: 'spa' },
    'salon': { type: 'hair_care', name: 'Salons', icon: 'cut', color: '#F59E0B', keyword: 'hair salon' },
    'hair salon': { type: 'hair_care', name: 'Salons', icon: 'cut', color: '#F59E0B', keyword: 'hair salon' },
    'barbershop': { type: 'barber_shop', name: 'Barbershops', icon: 'cut', color: '#3B82F6', keyword: 'barbershop' },
    
    // ===== RELIGIOUS PLACES =====
    'church': { type: 'church', name: 'Churches', icon: 'bulb', color: '#8B5CF6', keyword: 'church' },
    'mosque': { type: 'mosque', name: 'Mosques', icon: 'star', color: '#10B981', keyword: 'mosque' },
    'temple': { type: 'hindu_temple', name: 'Temples', icon: 'home', color: '#F59E0B', keyword: 'temple' },
    
    // ===== PERSONAL SERVICES =====
    'laundry': { type: 'laundry', name: 'Laundromats', icon: 'water', color: '#06B6D4', keyword: 'laundry' },
    'laundromat': { type: 'laundry', name: 'Laundromats', icon: 'water', color: '#06B6D4', keyword: 'laundromat' },
    'dry cleaner': { type: 'dry_cleaner', name: 'Dry Cleaners', icon: 'shirt', color: '#8B5CF6', keyword: 'dry cleaner' },
    
    // ===== AUTOMOTIVE SERVICES =====
    'car wash': { type: 'car_wash', name: 'Car Washes', icon: 'car', color: '#06B6D4', keyword: 'car wash' },
    'auto repair': { type: 'car_repair', name: 'Auto Repair', icon: 'construct', color: '#F97316', keyword: 'auto repair shop' },
    'mechanic': { type: 'car_repair', name: 'Auto Repair', icon: 'construct', color: '#F97316', keyword: 'mechanic' }
};

// Categories that need keyword search instead of type search
const KEYWORD_SEARCH_TYPES = [
    'barber_shop', 'hair_care', 'gym', 'spa', 'dentist', 
    'veterinary_care', 'doctor', 'car_wash', 'car_repair',
    'dry_cleaner', 'laundry', 'book_store', 'pet_store',
    'florist', 'gift_shop', 'hardware_store', 'local_government_office',
    'meal_takeaway', 'optician'
];

// Check if message is asking for nearby places
export const isNearbyQuery = (message) => {
    const lowerMessage = message.toLowerCase();
    const nearbyKeywords = ['near me', 'nearby', 'around me', 'close to me', 'closest', 'near here', 'find', 'looking for', 'where can i find'];
    
    const hasNearbyKeyword = nearbyKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasPlaceType = extractPlaceCategory(message) !== null;
    
    return (hasNearbyKeyword && hasPlaceType) || (hasPlaceType && (hasNearbyKeyword));
};

// Extract place category from query
export const extractPlaceCategory = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific keywords first (longer phrases first)
    const sortedKeywords = Object.keys(AI_PLACE_CATEGORIES).sort((a, b) => b.length - a.length);
    
    for (const keyword of sortedKeywords) {
        if (lowerMessage.includes(keyword)) {
            return AI_PLACE_CATEGORIES[keyword];
        }
    }
    
    return null;
};

// Function to fetch nearby places
export const fetchNearbyPlacesForAI = async (latitude, longitude, category, radius = 5000) => {
    if (!GOOGLE_API_KEY) {
        console.warn("Google API key missing");
        return [];
    }

    try {
        let url;
        
        // Check if this category type needs keyword search
        if (KEYWORD_SEARCH_TYPES.includes(category.type)) {
            const searchKeyword = category.keyword || category.name;
            url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchKeyword)}&location=${latitude},${longitude}&radius=${radius}&key=${GOOGLE_API_KEY}`;
            console.log(`Using keyword search for ${category.name}: ${searchKeyword}`);
        } else {
            url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${category.type}&key=${GOOGLE_API_KEY}`;
            console.log(`Using type search for ${category.name}: ${category.type}`);
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === "OK") {
            let results = data.results;
            
            // Additional filtering for specific categories
            if (category.type === 'cafe') {
                results = results.filter(r => 
                    !r.name.toLowerCase().includes('hotel') && 
                    !r.name.toLowerCase().includes('inn') &&
                    !r.name.toLowerCase().includes('restaurant')
                );
            }
            
            if (category.name === 'Barbershops') {
                results = results.filter(r => 
                    r.name.toLowerCase().includes('barber') || 
                    (r.types && r.types.includes('barber_shop'))
                );
            }
            
            if (category.name === 'Salons') {
                results = results.filter(r => 
                    r.name.toLowerCase().includes('salon') || 
                    r.name.toLowerCase().includes('hair') ||
                    (r.types && r.types.includes('hair_care'))
                );
            }
            
            if (category.name === 'Fast Food') {
                results = results.filter(r => 
                    r.name.toLowerCase().includes('mcdo') ||
                    r.name.toLowerCase().includes('jollibee') ||
                    r.name.toLowerCase().includes('kfc') ||
                    r.name.toLowerCase().includes('burger') ||
                    r.name.toLowerCase().includes('fast food')
                );
            }
            
            if (category.name === 'Barangay Hall') {
                results = results.filter(r => 
                    r.name.toLowerCase().includes('barangay') || 
                    r.name.toLowerCase().includes('hall')
                );
            }
            
            // Format results
            return results.slice(0, 8).map(place => ({
                id: place.place_id,
                name: place.name,
                address: place.vicinity || place.formatted_address || "Address unavailable",
                rating: place.rating || 0,
                totalRatings: place.user_ratings_total || 0,
                openNow: place.opening_hours?.open_now || false,
                priceLevel: place.price_level || 0,
                lat: place.geometry.location.lat,
                lon: place.geometry.location.lng,
                types: place.types
            }));
        }
        
        console.log(`No results found for ${category.name}, status: ${data.status}`);
        return [];
    } catch (error) {
        console.error("Error fetching places:", error);
        return [];
    }
};

// Format places into a beautiful response
export const formatPlacesForChat = (places, category) => {
    if (!places || places.length === 0) {
        return `I couldn't find any ${category.name.toLowerCase()} near your location. Try a different search or check your location settings. 🔍`;
    }
    
    let response = `📍 **${category.name} Near You**\n\n`;
    
    places.forEach((place, index) => {
        response += `${index + 1}. **${place.name}**\n`;
        response += `   📍 ${place.address}\n`;
        
        if (place.rating > 0) {
            response += `   ⭐ ${place.rating}/5`;
            if (place.totalRatings > 0) {
                response += ` (${place.totalRatings} reviews)`;
            }
            response += `\n`;
        }
        
        if (place.openNow) {
            response += `   🟢 Open now\n`;
        } else if (place.openNow === false) {
            response += `   🔴 Closed\n`;
        }
        
        if (place.priceLevel > 0) {
            const priceIcon = '💰'.repeat(place.priceLevel);
            response += `   ${priceIcon}\n`;
        }
        
        response += `\n`;
    });
    
    response += `💡 *Would you like directions to any of these places? Just ask!*`;
    
    return response;
};

// Helper function to get category by name
export const getCategoryByName = (name) => {
    const lowerName = name.toLowerCase();
    for (const [keyword, category] of Object.entries(AI_PLACE_CATEGORIES)) {
        if (category.name.toLowerCase() === lowerName || keyword === lowerName) {
            return category;
        }
    }
    return null;
};

// Get all available categories for suggestions
export const getAllAvailableCategories = () => {
    const uniqueCategories = new Map();
    for (const category of Object.values(AI_PLACE_CATEGORIES)) {
        if (!uniqueCategories.has(category.name)) {
            uniqueCategories.set(category.name, category);
        }
    }
    return Array.from(uniqueCategories.values());
};