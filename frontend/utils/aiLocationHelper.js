import { GOOGLE_API_KEY } from '../screens/EchoStamp/tabs/Explore/utils/Explore.utils';
// Categories mapping for AI queries
export const AI_PLACE_CATEGORIES = {
    'cafe': { type: 'cafe', name: 'Cafés', icon: 'cafe', color: '#A16207' },
    'cafes': { type: 'cafe', name: 'Cafés', icon: 'cafe', color: '#A16207' },
    'coffee': { type: 'cafe', name: 'Cafés', icon: 'cafe', color: '#A16207' },
    'coffee shop': { type: 'cafe', name: 'Cafés', icon: 'cafe', color: '#A16207' },
    'restaurant': { type: 'restaurant', name: 'Restaurants', icon: 'restaurant', color: '#FB923C' },
    'restaurants': { type: 'restaurant', name: 'Restaurants', icon: 'restaurant', color: '#FB923C' },
    'food': { type: 'restaurant', name: 'Restaurants', icon: 'restaurant', color: '#FB923C' },
    'hotel': { type: 'lodging', name: 'Hotels', icon: 'bed', color: '#60A5FA' },
    'hotels': { type: 'lodging', name: 'Hotels', icon: 'bed', color: '#60A5FA' },
    'park': { type: 'park', name: 'Parks', icon: 'leaf', color: '#4ADE80' },
    'parks': { type: 'park', name: 'Parks', icon: 'leaf', color: '#4ADE80' },
    'nature': { type: 'park', name: 'Nature Spots', icon: 'leaf', color: '#4ADE80' },
    'museum': { type: 'museum', name: 'Museums', icon: 'color-palette', color: '#A855F7' },
    'museums': { type: 'museum', name: 'Museums', icon: 'color-palette', color: '#A855F7' },
    'shopping': { type: 'shopping_mall', name: 'Shopping Malls', icon: 'cart', color: '#EC4899' },
    'mall': { type: 'shopping_mall', name: 'Shopping Malls', icon: 'cart', color: '#EC4899' },
    'malls': { type: 'shopping_mall', name: 'Shopping Malls', icon: 'cart', color: '#EC4899' },
    'bar': { type: 'bar', name: 'Bars & Nightlife', icon: 'beer', color: '#F43F5E' },
    'bars': { type: 'bar', name: 'Bars & Nightlife', icon: 'beer', color: '#F43F5E' },
    'nightlife': { type: 'bar', name: 'Nightlife', icon: 'beer', color: '#F43F5E' },
    'grocery': { type: 'grocery_or_supermarket', name: 'Grocery Stores', icon: 'cart', color: '#EC4899' },
    'supermarket': { type: 'grocery_or_supermarket', name: 'Supermarkets', icon: 'cart', color: '#EC4899' },
    'pharmacy': { type: 'pharmacy', name: 'Pharmacies', icon: 'medical', color: '#10B981' },
    'hospital': { type: 'hospital', name: 'Hospitals', icon: 'medical', color: '#EF4444' },
    'atm': { type: 'atm', name: 'ATMs', icon: 'cash', color: '#F59E0B' },
    'bank': { type: 'bank', name: 'Banks', icon: 'business', color: '#6366F1' }
};

// Check if message is asking for nearby places
export const isNearbyQuery = (message) => {
    const lowerMessage = message.toLowerCase();
    const nearbyKeywords = ['near me', 'nearby', 'around me', 'close to me', 'closest', 'near here'];
    const hasNearbyKeyword = nearbyKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Check if it contains any place type
    const hasPlaceType = Object.keys(AI_PLACE_CATEGORIES).some(keyword => 
        lowerMessage.includes(keyword)
    );
    
    return hasNearbyKeyword && hasPlaceType;
};

// Extract place category from query
export const extractPlaceCategory = (message) => {
    const lowerMessage = message.toLowerCase();
    
    for (const [keyword, category] of Object.entries(AI_PLACE_CATEGORIES)) {
        if (lowerMessage.includes(keyword)) {
            return category;
        }
    }
    return null;
};

// Function to fetch nearby places (same as explore component)
export const fetchNearbyPlacesForAI = async (latitude, longitude, category) => {
    if (!GOOGLE_API_KEY) {
        console.warn("Google API key missing");
        return [];
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=${category.type}&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === "OK") {
            let results = data.results;
            // Filter out hotels when looking for cafes
            if (category.type === 'cafe') {
                results = data.results.filter(r => 
                    !r.name.toLowerCase().includes('hotel') && 
                    !r.name.toLowerCase().includes('inn')
                );
            }
            
            // Format results similar to explore component
            return results.slice(0, 8).map(place => ({
                id: place.place_id,
                name: place.name,
                address: place.vicinity || "Address unavailable",
                rating: place.rating || 0,
                totalRatings: place.user_ratings_total || 0,
                openNow: place.opening_hours?.open_now || false,
                priceLevel: place.price_level || 0,
                lat: place.geometry.location.lat,
                lon: place.geometry.location.lng
            }));
        }
        
        return [];
    } catch (error) {
        console.error("Error fetching places:", error);
        return [];
    }
};

// Format places into a beautiful response
export const formatPlacesForChat = (places, category) => {
    if (!places || places.length === 0) {
        return `I couldn't find any ${category.name.toLowerCase()} near you. Try searching for something else! 🔍`;
    }
    
    let response = `📍 **${category.name} Near You**\n\n`;
    
    places.forEach((place, index) => {
        response += `*${index + 1}. ${place.name}*\n`;
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
    
    response += `💡 *Want directions? Just ask me!*`;
    
    return response;
};