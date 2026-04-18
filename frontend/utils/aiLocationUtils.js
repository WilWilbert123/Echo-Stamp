import { GOOGLE_API_KEY } from '../screens/EchoStamp/tabs/Explore/utils/Explore.utils';

// Categories mapping for AI queries
export const AI_CATEGORIES = {
    'cafe': { type: 'cafe', name: 'Cafés', icon: 'cafe' },
    'cafes': { type: 'cafe', name: 'Cafés', icon: 'cafe' },
    'coffee': { type: 'cafe', name: 'Cafés', icon: 'cafe' },
    'restaurant': { type: 'restaurant', name: 'Restaurants', icon: 'restaurant' },
    'restaurants': { type: 'restaurant', name: 'Restaurants', icon: 'restaurant' },
    'food': { type: 'restaurant', name: 'Restaurants', icon: 'restaurant' },
    'hotel': { type: 'lodging', name: 'Hotels', icon: 'bed' },
    'hotels': { type: 'lodging', name: 'Hotels', icon: 'bed' },
    'lodging': { type: 'lodging', name: 'Hotels', icon: 'bed' },
    'park': { type: 'park', name: 'Parks', icon: 'leaf' },
    'parks': { type: 'park', name: 'Parks', icon: 'leaf' },
    'nature': { type: 'park', name: 'Nature Spots', icon: 'leaf' },
    'museum': { type: 'museum', name: 'Museums', icon: 'color-palette' },
    'museums': { type: 'museum', name: 'Museums', icon: 'color-palette' },
    'shopping': { type: 'shopping_mall', name: 'Shopping Malls', icon: 'cart' },
    'mall': { type: 'shopping_mall', name: 'Shopping Malls', icon: 'cart' },
    'malls': { type: 'shopping_mall', name: 'Shopping Malls', icon: 'cart' },
    'bar': { type: 'bar', name: 'Bars & Nightlife', icon: 'beer' },
    'bars': { type: 'bar', name: 'Bars & Nightlife', icon: 'beer' },
    'nightlife': { type: 'bar', name: 'Nightlife', icon: 'beer' },
    'grocery': { type: 'grocery_or_supermarket', name: 'Grocery Stores', icon: 'cart' },
    'supermarket': { type: 'grocery_or_supermarket', name: 'Supermarkets', icon: 'cart' },
    'pharmacy': { type: 'pharmacy', name: 'Pharmacies', icon: 'medical' },
    'hospital': { type: 'hospital', name: 'Hospitals', icon: 'medical' },
    'atm': { type: 'atm', name: 'ATMs', icon: 'cash' },
    'bank': { type: 'bank', name: 'Banks', icon: 'business' }
};

// Function to extract place type from user query
export const extractPlaceTypeFromQuery = (message) => {
    const lowerMessage = message.toLowerCase();
    
    for (const [keyword, category] of Object.entries(AI_CATEGORIES)) {
        if (lowerMessage.includes(keyword)) {
            return category;
        }
    }
    return null;
};

// Function to check if message is asking for nearby places
export const isNearbyPlaceQuery = (message) => {
    const lowerMessage = message.toLowerCase();
    const nearbyKeywords = ['near me', 'nearby', 'around me', 'close to me', 'closest', 'near here'];
    
    // Check if it's asking for nearby places
    const hasNearbyKeyword = nearbyKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasPlaceType = extractPlaceTypeFromQuery(message) !== null;
    
    // Also check for question patterns
    const questionPatterns = [
        /where (can|do) i find/i,
        /find (a|the) /i,
        /looking for/i,
        /suggest (a|the)/i,
        /recommend (a|the)/i
    ];
    
    const hasQuestionPattern = questionPatterns.some(pattern => pattern.test(lowerMessage));
    
    return (hasNearbyKeyword && hasPlaceType) || (hasPlaceType && (hasQuestionPattern || hasNearbyKeyword));
};

// Function to fetch nearby places using Google Places API
export const fetchNearbyPlaces = async (latitude, longitude, category, radius = 5000) => {
    if (!GOOGLE_API_KEY) {
        console.warn("Google API key missing");
        return null;
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${category.type}&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === "OK") {
            // Filter out places that might be hotels when looking for cafes
            let results = data.results;
            if (category.type === 'cafe') {
                results = data.results.filter(r => 
                    !r.name.toLowerCase().includes('hotel') && 
                    !r.name.toLowerCase().includes('inn')
                );
            }
            
            // Format the results
            return results.slice(0, 10).map(place => ({
                id: place.place_id,
                name: place.name,
                address: place.vicinity || "Address unavailable",
                rating: place.rating || 0,
                totalRatings: place.user_ratings_total || 0,
                lat: place.geometry.location.lat,
                lon: place.geometry.location.lng,
                openNow: place.opening_hours?.open_now || false,
                priceLevel: place.price_level || 0,
                types: place.types
            }));
        }
        
        return [];
    } catch (error) {
        console.error("Error fetching nearby places:", error);
        return [];
    }
};

// Format places into a readable response
export const formatPlacesResponse = (places, categoryName, location) => {
    if (!places || places.length === 0) {
        return `I couldn't find any ${categoryName} near your location. Try searching for something else or check your connection. 🔍`;
    }
    
    let response = `📍 **Nearby ${categoryName}** (within ${places.length} results)\n\n`;
    
    places.forEach((place, index) => {
        response += `${index + 1}. **${place.name}**\n`;
        response += `   📍 ${place.address}\n`;
        if (place.rating > 0) {
            response += `   ⭐ ${place.rating}/5 (${place.totalRatings} reviews)\n`;
        }
        if (place.openNow !== undefined) {
            response += `   ${place.openNow ? '🟢 Open now' : '🔴 Closed'}\n`;
        }
        if (place.priceLevel > 0) {
            const priceSymbols = '💰'.repeat(place.priceLevel);
            response += `   ${priceSymbols}\n`;
        }
        response += '\n';
    });
    
    response += `💡 *Tip: You can ask for directions to any of these places!*`;
    
    return response;
};