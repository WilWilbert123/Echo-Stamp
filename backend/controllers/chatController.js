const axios = require('axios');
const Chat = require("../models/Chat");
const Echo = require("../models/Echo");

// Helper function to get user's echo statistics
const getUserEchoStats = async (userId) => {
    try {
        const total = await Echo.countDocuments({ userId });
        const breakdown = await Echo.aggregate([
            { $match: { userId } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);
        
        const stats = { 
            total: total, 
            mood: 0, 
            gratitude: 0, 
            memory: 0 
        };
        
        breakdown.forEach(item => {
            if (item._id === 'mood') stats.mood = item.count;
            if (item._id === 'gratitude') stats.gratitude = item.count;
            if (item._id === 'memory') stats.memory = item.count;
        });
        
        return stats;
    } catch (error) {
        console.error("Error getting echo stats:", error);
        return { total: 0, mood: 0, gratitude: 0, memory: 0 };
    }
};

// Reverse geocoding using OpenStreetMap (free, no API key needed)
const getAddressFromOpenStreetMap = async (latitude, longitude) => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse`;
        const params = {
            lat: latitude,
            lon: longitude,
            format: 'json',
            addressdetails: 1,
            'accept-language': 'en'
        };
        
        const response = await axios.get(url, { 
            params, 
            timeout: 8000, 
            headers: { 'User-Agent': 'EchoStamp-App/1.0' } 
        });
        
        if (response.data && response.data.address) {
            const address = response.data.address;
            
            let street = address.road || address.pedestrian || '';
            let streetNumber = address.house_number || '';
            let barangay = address.suburb || address.neighbourhood || address.village || address.town || '';
            let city = address.city || address.municipality || address.town || '';
            let province = address.state || address.province || address.region || '';
            let country = address.country || '';
            let postalCode = address.postcode || '';
            let fullAddress = response.data.display_name;
            
            if (!barangay) {
                barangay = address.village || address.neighbourhood || address.suburb || address.hamlet || '';
            }
            
            let fullStreet = '';
            if (streetNumber && street) {
                fullStreet = `${streetNumber} ${street}`;
            } else if (street) {
                fullStreet = street;
            } else if (streetNumber) {
                fullStreet = streetNumber;
            }
            
            let filipinoFormat = '';
            if (barangay && city && province) {
                filipinoFormat = `${barangay}, ${city}, ${province}`;
            } else if (barangay && city) {
                filipinoFormat = `${barangay}, ${city}`;
            } else if (barangay && province) {
                filipinoFormat = `${barangay}, ${province}`;
            } else if (city && province) {
                filipinoFormat = `${city}, ${province}`;
            } else if (city) {
                filipinoFormat = city;
            } else if (barangay) {
                filipinoFormat = barangay;
            } else {
                filipinoFormat = fullAddress;
            }
            
            const addressParts = [];
            if (fullStreet) addressParts.push(fullStreet);
            if (barangay) addressParts.push(barangay);
            if (city) addressParts.push(city);
            if (province) addressParts.push(province);
            if (country) addressParts.push(country);
            
            const philippineAddress = addressParts.join(', ');
            
            console.log("✅ OpenStreetMap reverse geocoding successful:", filipinoFormat);
            
            return {
                fullAddress: fullAddress,
                philippineAddress: philippineAddress,
                filipinoFormat: filipinoFormat,
                street: fullStreet,
                barangay: barangay,
                city: city,
                province: province,
                country: country,
                postalCode: postalCode,
                latitude: latitude,
                longitude: longitude
            };
        }
        
        console.warn("OpenStreetMap returned no address data");
        return null;
        
    } catch (error) {
        console.error("Error with OpenStreetMap reverse geocoding:", error.message);
        return null;
    }
};

// Enhanced: Reverse geocoding - get detailed address from coordinates
const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
        const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
        
        if (GOOGLE_PLACES_API_KEY) {
            const url = `https://maps.googleapis.com/maps/api/geocode/json`;
            const params = {
                latlng: `${latitude},${longitude}`,
                key: GOOGLE_PLACES_API_KEY,
                language: 'en'
            };

            console.log(`Reverse geocoding with Google: ${latitude}, ${longitude}`);
            const response = await axios.get(url, { params, timeout: 8000 });
            
            if (response.data.status === 'OK' && response.data.results.length > 0) {
                const result = response.data.results[0];
                
                let street = '';
                let streetNumber = '';
                let barangay = '';
                let city = '';
                let province = '';
                let country = '';
                let postalCode = '';
                let fullAddress = result.formatted_address;
                
                result.address_components.forEach(component => {
                    const types = component.types;
                    
                    if (types.includes('street_number')) {
                        streetNumber = component.long_name;
                    }
                    if (types.includes('route')) {
                        street = component.long_name;
                    }
                    if (types.includes('sublocality') || types.includes('neighborhood') || types.includes('sublocality_level_1')) {
                        barangay = component.long_name;
                    }
                    if (types.includes('locality') || types.includes('administrative_area_level_3')) {
                        city = component.long_name;
                    }
                    if (types.includes('administrative_area_level_1')) {
                        province = component.long_name;
                    }
                    if (types.includes('country')) {
                        country = component.long_name;
                    }
                    if (types.includes('postal_code')) {
                        postalCode = component.long_name;
                    }
                });
                
                let fullStreet = '';
                if (streetNumber && street) {
                    fullStreet = `${streetNumber} ${street}`;
                } else if (street) {
                    fullStreet = street;
                } else if (streetNumber) {
                    fullStreet = streetNumber;
                }
                
                if (!barangay) {
                    const sublocality = result.address_components.find(comp => 
                        comp.types.includes('sublocality') || 
                        comp.types.includes('neighborhood') ||
                        comp.types.includes('administrative_area_level_4') ||
                        comp.types.includes('administrative_area_level_2')
                    );
                    if (sublocality) {
                        barangay = sublocality.long_name;
                    }
                }
                
                let filipinoFormat = '';
                if (barangay && city && province) {
                    filipinoFormat = `${barangay}, ${city}, ${province}`;
                } else if (barangay && city) {
                    filipinoFormat = `${barangay}, ${city}`;
                } else if (barangay && province) {
                    filipinoFormat = `${barangay}, ${province}`;
                } else if (city && province) {
                    filipinoFormat = `${city}, ${province}`;
                } else if (city) {
                    filipinoFormat = city;
                } else if (barangay) {
                    filipinoFormat = barangay;
                } else {
                    filipinoFormat = fullAddress;
                }
                
                let philippineAddress = '';
                const addressParts = [];
                
                if (fullStreet) addressParts.push(fullStreet);
                if (barangay) addressParts.push(barangay);
                if (city) addressParts.push(city);
                if (province) addressParts.push(province);
                if (country) addressParts.push(country);
                
                philippineAddress = addressParts.join(', ');
                
                console.log("✅ Google reverse geocoding successful:", filipinoFormat);
                
                return {
                    fullAddress: fullAddress,
                    philippineAddress: philippineAddress,
                    filipinoFormat: filipinoFormat,
                    street: fullStreet,
                    barangay: barangay,
                    city: city,
                    province: province,
                    country: country,
                    postalCode: postalCode,
                    latitude: latitude,
                    longitude: longitude
                };
            }
            
            console.warn(`Google Geocoding returned status: ${response.data.status}`);
        }
        
        console.log("Falling back to OpenStreetMap for reverse geocoding");
        return await getAddressFromOpenStreetMap(latitude, longitude);
        
    } catch (error) {
        console.error("Error getting address from coordinates:", error.message);
        return await getAddressFromOpenStreetMap(latitude, longitude);
    }
};

// Get weather for specific city
const getWeatherByCity = async (cityName) => {
    try {
        const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
        
        if (!WEATHER_API_KEY) {
            console.warn("Weather API key missing");
            return null;
        }

        const url = `https://api.openweathermap.org/data/2.5/weather`;
        const params = {
            q: cityName,
            appid: WEATHER_API_KEY,
            units: 'metric'
        };

        const response = await axios.get(url, { params, timeout: 8000 });
        
        if (response.data) {
            return {
                temp: Math.round(response.data.main.temp),
                feelsLike: Math.round(response.data.main.feels_like),
                description: response.data.weather[0].description,
                humidity: response.data.main.humidity,
                windSpeed: response.data.wind.speed,
                city: response.data.name,
                country: response.data.sys.country
            };
        }
        
        return null;
    } catch (error) {
        console.error("Error getting weather for city:", error.message);
        return null;
    }
};

// Get weather information for current location
const getWeatherInfo = async (latitude, longitude) => {
    try {
        const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
        
        if (!WEATHER_API_KEY) {
            console.warn("Weather API key missing");
            return null;
        }

        const url = `https://api.openweathermap.org/data/2.5/weather`;
        const params = {
            lat: latitude,
            lon: longitude,
            appid: WEATHER_API_KEY,
            units: 'metric'
        };

        const response = await axios.get(url, { params, timeout: 8000 });
        
        if (response.data) {
            return {
                temp: Math.round(response.data.main.temp),
                feelsLike: Math.round(response.data.main.feels_like),
                description: response.data.weather[0].description,
                humidity: response.data.main.humidity,
                windSpeed: response.data.wind.speed,
                city: response.data.name,
                country: response.data.sys.country
            };
        }
        
        return null;
    } catch (error) {
        console.error("Error getting weather:", error.message);
        return null;
    }
};

// Extract city name from weather query
const extractCityFromWeatherQuery = (message) => {
    const patterns = [
        /weather in (\w+(?:\s+\w+)*)/i,
        /temperature in (\w+(?:\s+\w+)*)/i,
        /forecast for (\w+(?:\s+\w+)*)/i,
        /weather (\w+(?:\s+\w+)*)/i,
        /what is the weather in (\w+(?:\s+\w+)*)/i
    ];
    
    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    return null;
};

// PLACE CATEGORIES for nearby searches
const PLACE_CATEGORIES = {
    'parking': { type: 'parking', name: 'Parking Lots', keyword: 'parking lot' },
    'parking lot': { type: 'parking', name: 'Parking Lots', keyword: 'parking lot' },
    'gas station': { type: 'gas_station', name: 'Gas Stations', keyword: 'gas station' },
    'city hall': { type: 'city_hall', name: 'City Hall', keyword: 'city hall' },
    'barangay hall': { type: 'local_government_office', name: 'Barangay Hall', keyword: 'barangay hall' },
    'barangay': { type: 'local_government_office', name: 'Barangay Hall', keyword: 'barangay hall' },
    'police': { type: 'police', name: 'Police Stations', keyword: 'police station' },
    'police station': { type: 'police', name: 'Police Stations', keyword: 'police station' },
    'fire station': { type: 'fire_station', name: 'Fire Stations', keyword: 'fire station' },
    'post office': { type: 'post_office', name: 'Post Offices', keyword: 'post office' },
    'hospital': { type: 'hospital', name: 'Hospitals', keyword: 'hospital' },
    'clinic': { type: 'doctor', name: 'Clinics', keyword: 'medical clinic' },
    'pharmacy': { type: 'pharmacy', name: 'Pharmacies', keyword: 'pharmacy' },
    'drugstore': { type: 'pharmacy', name: 'Pharmacies', keyword: 'pharmacy' },
    'dentist': { type: 'dentist', name: 'Dentists', keyword: 'dentist' },
    'school': { type: 'school', name: 'Schools', keyword: 'school' },
    'university': { type: 'university', name: 'Universities', keyword: 'university' },
    'college': { type: 'university', name: 'Universities', keyword: 'college' },
    'library': { type: 'library', name: 'Libraries', keyword: 'library' },
    'mall': { type: 'shopping_mall', name: 'Malls', keyword: 'shopping mall' },
    'shopping mall': { type: 'shopping_mall', name: 'Malls', keyword: 'shopping mall' },
    'supermarket': { type: 'supermarket', name: 'Supermarkets', keyword: 'supermarket' },
    'grocery': { type: 'supermarket', name: 'Supermarkets', keyword: 'grocery store' },
    'convenience store': { type: 'convenience_store', name: 'Convenience Stores', keyword: 'convenience store' },
    'bakery': { type: 'bakery', name: 'Bakeries', keyword: 'bakery' },
    'bookstore': { type: 'book_store', name: 'Bookstores', keyword: 'bookstore' },
    'restaurant': { type: 'restaurant', name: 'Restaurants', keyword: 'restaurant' },
    'restaurants': { type: 'restaurant', name: 'Restaurants', keyword: 'restaurant' },
    'food': { type: 'restaurant', name: 'Restaurants', keyword: 'restaurant' },
    'fast food': { type: 'meal_takeaway', name: 'Fast Food', keyword: 'fast food' },
    'fastfood': { type: 'meal_takeaway', name: 'Fast Food', keyword: 'fast food' },
    'cafe': { type: 'cafe', name: 'Cafés', keyword: 'cafe' },
    'cafes': { type: 'cafe', name: 'Cafés', keyword: 'cafe' },
    'coffee': { type: 'cafe', name: 'Cafés', keyword: 'coffee shop' },
    'coffee shop': { type: 'cafe', name: 'Cafés', keyword: 'coffee shop' },
    'bar': { type: 'bar', name: 'Bars/Pubs', keyword: 'bar' },
    'pub': { type: 'bar', name: 'Bars/Pubs', keyword: 'pub' },
    'hotel': { type: 'lodging', name: 'Hotels', keyword: 'hotel' },
    'hotels': { type: 'lodging', name: 'Hotels', keyword: 'hotel' },
    'bank': { type: 'bank', name: 'Banks', keyword: 'bank' },
    'atm': { type: 'atm', name: 'ATMs', keyword: 'atm' },
    'movie theater': { type: 'movie_theater', name: 'Movie Theaters', keyword: 'movie theater' },
    'cinema': { type: 'movie_theater', name: 'Movie Theaters', keyword: 'cinema' },
    'park': { type: 'park', name: 'Parks', keyword: 'park' },
    'museum': { type: 'museum', name: 'Museums', keyword: 'museum' },
    'art gallery': { type: 'art_gallery', name: 'Art Galleries', keyword: 'art gallery' },
    'gym': { type: 'gym', name: 'Gyms', keyword: 'gym' },
    'fitness': { type: 'gym', name: 'Gyms', keyword: 'fitness center' },
    'spa': { type: 'spa', name: 'Spas', keyword: 'spa' },
    'salon': { type: 'hair_care', name: 'Salons', keyword: 'hair salon' },
    'hair salon': { type: 'hair_care', name: 'Salons', keyword: 'hair salon' },
    'barbershop': { type: 'barber_shop', name: 'Barbershops', keyword: 'barbershop' },
    'church': { type: 'church', name: 'Churches', keyword: 'church' },
    'mosque': { type: 'mosque', name: 'Mosques', keyword: 'mosque' },
    'temple': { type: 'hindu_temple', name: 'Temples', keyword: 'temple' },
    'laundry': { type: 'laundry', name: 'Laundromats', keyword: 'laundry' },
    'laundromat': { type: 'laundry', name: 'Laundromats', keyword: 'laundromat' },
    'dry cleaner': { type: 'dry_cleaner', name: 'Dry Cleaners', keyword: 'dry cleaner' },
    'car wash': { type: 'car_wash', name: 'Car Washes', keyword: 'car wash' },
    'auto repair': { type: 'car_repair', name: 'Auto Repair', keyword: 'auto repair shop' },
    'mechanic': { type: 'car_repair', name: 'Auto Repair', keyword: 'mechanic' }
};

// Check if message is asking for nearby places
const isNearbyQuery = (message) => {
    const lowerMessage = message.toLowerCase();
    const nearbyKeywords = ['near me', 'nearby', 'around me', 'close to me', 'closest', 'near here', 'find', 'looking for', 'where can i find'];
    
    const hasNearbyKeyword = nearbyKeywords.some(keyword => lowerMessage.includes(keyword));
    
    let hasPlaceType = false;
    for (const keyword of Object.keys(PLACE_CATEGORIES)) {
        if (lowerMessage.includes(keyword)) {
            hasPlaceType = true;
            break;
        }
    }
    
    return (hasNearbyKeyword && hasPlaceType);
};

const extractPlaceCategory = (message) => {
    const lowerMessage = message.toLowerCase();
    const sortedKeywords = Object.keys(PLACE_CATEGORIES).sort((a, b) => b.length - a.length);
    
    for (const keyword of sortedKeywords) {
        if (lowerMessage.includes(keyword)) {
            return PLACE_CATEGORIES[keyword];
        }
    }
    return null;
};

const searchNearbyPlacesEnhanced = async (latitude, longitude, category) => {
    try {
        const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
        
        if (!GOOGLE_API_KEY) {
            console.warn("Google Places API key missing");
            return null;
        }

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=${category.type}&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(url, { timeout: 8000 });
        
        if (response.data.status === 'OK' && response.data.results.length > 0) {
            let results = response.data.results;
            
            // Additional filtering for specific categories
            if (category.type === 'cafe') {
                results = results.filter(r => 
                    !r.name.toLowerCase().includes('hotel') && 
                    !r.name.toLowerCase().includes('inn')
                );
            }
            
            if (category.name === 'Barbershops') {
                results = results.filter(r => 
                    r.name.toLowerCase().includes('barber') || 
                    (r.types && r.types.includes('barber_shop'))
                );
            }
            
            if (category.name === 'Fast Food') {
                results = results.filter(r => 
                    r.name.toLowerCase().includes('mcdo') ||
                    r.name.toLowerCase().includes('jollibee') ||
                    r.name.toLowerCase().includes('kfc') ||
                    r.name.toLowerCase().includes('burger')
                );
            }
            
            return results.slice(0, 10).map(place => ({
                name: place.name,
                address: place.vicinity,
                rating: place.rating,
                totalRatings: place.user_ratings_total,
                openNow: place.opening_hours?.open_now,
                priceLevel: place.price_level,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
            }));
        }
        
        return null;
    } catch (error) {
        console.error("Error searching nearby places:", error.message);
        return null;
    }
};

const formatNearbyPlacesResponse = (places, categoryName) => {
    if (!places || places.length === 0) {
        return `I couldn't find any ${categoryName.toLowerCase()} near your location. Try a different search or check your connection. 🔍`;
    }
    
    let response = `📍 **Nearby ${categoryName}** (found ${places.length} places)\n\n`;
    
    places.forEach((place, index) => {
        response += `${index + 1}. **${place.name}**\n`;
        response += `   📍 ${place.address}\n`;
        if (place.rating) {
            response += `   ⭐ ${place.rating}/5 (${place.totalRatings || 0} reviews)\n`;
        }
        if (place.openNow !== undefined) {
            response += `   ${place.openNow ? '🟢 Open now' : '🔴 Closed'}\n`;
        }
        if (place.priceLevel) {
            const priceSymbols = '💰'.repeat(place.priceLevel);
            response += `   ${priceSymbols}\n`;
        }
        response += '\n';
    });
    
    response += `💡 *Would you like directions to any of these places? Just ask!*`;
    return response;
};

// Check if asking for current location
const isAskingForLocation = (message) => {
    const locationQuestions = [
        'where am i', 'my location', 'current location', 'where i am',
        'what is my location', 'address', 'where am i right now',
        'what is my current location', 'tell me my location',
        'whats my location', 'where do i live', 'what is my address'
    ];
    
    const lowerMessage = message.toLowerCase();
    return locationQuestions.some(question => lowerMessage.includes(question));
};

// Check if asking for weather
const isAskingForWeather = (message) => {
    const lowerMessage = message.toLowerCase();
    
    const weatherPatterns = [
        /\bweather\b/,
        /\btemperature\b/,
        /\bforecast\b/,
        /\bhot\b(?!el)/,
        /\bcold\b/,
        /\brain\b/,
        /what('s| is) the weather/,
        /how is the weather/
    ];
    
    return weatherPatterns.some(pattern => pattern.test(lowerMessage));
};

// Check if it's a general knowledge question
const isGeneralKnowledgeQuery = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Don't treat as general knowledge if it's about location, weather, or nearby places
    if (isNearbyQuery(message) || isAskingForLocation(message) || isAskingForWeather(message)) {
        return false;
    }
    
    const knowledgePatterns = [
        /what is/i, /who is/i, /who created/i, /who made/i, /when was/i, /how to/i,
        /ingredient/i, /recipe/i, /history of/i, /meaning of/i, /definition of/i,
        /tell me about/i, /explain/i, /what are/i, /how does/i, /why is/i,
        /can you tell me/i, /do you know/i, /what's the/i
    ];
    
    return knowledgePatterns.some(pattern => pattern.test(lowerMessage));
};

// Get answer from Gemini for general questions (WITH MODEL STACK)
const getGeminiResponse = async (message, echoStats, location) => {
    const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        console.warn("Gemini API key missing");
        return null;
    }

    const systemPrompt = `You are Echo AI, a warm, helpful, and knowledgeable assistant. You can answer any question - from cooking recipes to tech facts, history, science, and more. Be conversational, friendly, and accurate. Keep responses concise but informative (2-4 sentences for simple questions, longer for complex ones).

Current context:
- User has ${echoStats.total} journal entries (${echoStats.mood} moods, ${echoStats.gratitude} gratitudes, ${echoStats.memory} memories)
${location ? `- User location: ${location.latitude}, ${location.longitude}` : '- Location not shared'}

Remember:
1. Answer general questions naturally and accurately
2. If asked about Filipino food (like adobo, sinigang), share authentic recipes
3. For tech questions (PS5, iPhone, etc.), provide accurate facts
4. Keep responses warm and engaging with emojis occasionally
5. Don't pretend to know things you don't - say "I'm not sure" if needed
6. Be concise - don't write extremely long responses
7. You are a smart AI - answer any question the user asks!`;

    // Model stack for fallback (from fastest/cheapest to most capable)
    const modelStack = [
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash-lite", 
        "gemini-2.0-flash",
        "gemini-2.5-flash",
        "gemini-2.5-pro"
    ];

    for (const modelName of modelStack) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
            
            const payload = {
                contents: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: "I understand! I'm Echo AI, ready to answer any question - from recipes to tech facts, history, science, and more. Ask me anything! ✨" }] },
                    { role: "user", parts: [{ text: message }] }
                ],
                generationConfig: {
                    maxOutputTokens: 800,
                    temperature: 0.7,
                    topP: 0.9,
                }
            };

            const response = await axios.post(url, payload, { timeout: 15000 });
            const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text && text.length > 0) {
                console.log(`✅ Gemini response successful with model: ${modelName}`);
                return text;
            }
        } catch (error) {
            const status = error.response?.status;
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.warn(`⚠️ Model ${modelName} failed (${status}): ${errorMsg}`);
            
            // Continue to next model on rate limit or server errors
            if (status === 429 || status === 500 || status === 503 || !status || error.code === 'ECONNABORTED') {
                continue;
            } else {
                // For other errors (like 401, 403), break out of the loop
                break;
            }
        }
    }
    
    console.error("All Gemini models failed");
    return null;
};

// Enhanced fallback response
const getFallbackResponse = async (message, echoStats, location) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Nearby places
    if (isNearbyQuery(message)) {
        if (location && location.latitude && location.longitude) {
            const category = extractPlaceCategory(message);
            if (category) {
                const places = await searchNearbyPlacesEnhanced(location.latitude, location.longitude, category);
                if (places && places.length > 0) {
                    return formatNearbyPlacesResponse(places, category.name);
                } else {
                    return `I couldn't find any ${category.name.toLowerCase()} near your location. Try a different search or check your connection. 🔍`;
                }
            }
            return "What type of place are you looking for? (restaurant, hospital, bank, barbershop, etc.) 📍";
        }
        return "I need your location to find places near you. Please enable location services and try again. 📍";
    }
    
    // Where am I
    if (isAskingForLocation(message)) {
        if (location && location.latitude && location.longitude) {
            const addressInfo = await getAddressFromCoordinates(location.latitude, location.longitude);
            if (addressInfo && (addressInfo.filipinoFormat || addressInfo.philippineAddress)) {
                let response = `📍 **Your Current Location:**\n\n`;
                
                if (addressInfo.filipinoFormat && addressInfo.filipinoFormat !== addressInfo.fullAddress) {
                    response += `${addressInfo.filipinoFormat}\n\n`;
                } else if (addressInfo.philippineAddress) {
                    response += `${addressInfo.philippineAddress}\n\n`;
                } else if (addressInfo.fullAddress) {
                    response += `${addressInfo.fullAddress}\n\n`;
                }
                
                if (addressInfo.street) response += `🏠 Street: ${addressInfo.street}\n`;
                if (addressInfo.barangay) response += `📍 Barangay: ${addressInfo.barangay}\n`;
                if (addressInfo.city) response += `🏙️ City/Municipality: ${addressInfo.city}\n`;
                if (addressInfo.province) response += `🏞️ Province: ${addressInfo.province}\n`;
                if (addressInfo.country) response += `🌏 Country: ${addressInfo.country}\n`;
                
                response += `\nI hope this helps you navigate! 🗺️`;
                return response;
            }
            return `📍 Your current coordinates are: ${location.latitude}, ${location.longitude}`;
        }
        return "I need your location to tell you where you are. Please enable location services and try again. 📍";
    }
    
    // Weather
    if (isAskingForWeather(message)) {
        const specificCity = extractCityFromWeatherQuery(message);
        
        if (specificCity) {
            const weather = await getWeatherByCity(specificCity);
            if (weather) {
                return `🌤️ **Weather in ${weather.city}, ${weather.country}**\n\n🌡️ Temperature: ${weather.temp}°C (feels like ${weather.feelsLike}°C)\n☁️ Condition: ${weather.description}\n💧 Humidity: ${weather.humidity}%\n💨 Wind Speed: ${weather.windSpeed} m/s\n\nStay safe and have a great day! ✨`;
            }
            return `I couldn't find weather information for "${specificCity}". Please check the city name and try again. 🌤️`;
        }
        
        if (location && location.latitude && location.longitude) {
            const weather = await getWeatherInfo(location.latitude, location.longitude);
            if (weather) {
                return `🌤️ **Weather in ${weather.city}, ${weather.country}**\n\n🌡️ Temperature: ${weather.temp}°C (feels like ${weather.feelsLike}°C)\n☁️ Condition: ${weather.description}\n💧 Humidity: ${weather.humidity}%\n💨 Wind Speed: ${weather.windSpeed} m/s\n\nStay safe and have a great day! ✨`;
            }
            return "I couldn't fetch the weather right now. Please try again later. 🌤️";
        }
        return "I'd love to tell you the weather! 🌤️\n\nEnable location or ask for a specific city like 'weather in Manila'.";
    }
    
    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
        const greetings = [
            "Hello! I'm Echo, your AI assistant. I can answer any question - from recipes to tech facts, or help with your journal. What would you like to know? ✨",
            "Hi there! I'm Echo. Ask me anything about the world, your journal, or find places near you! 💫",
            "Hey! Great to see you. I'm Echo - I can help with general knowledge, weather, nearby places, or your journal stats! 🌟"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // How are you
    if (lowerMessage.match(/how are you|how's it going|how do you do/)) {
        const responses = [
            "I'm doing wonderful, thank you for asking! How are you feeling today? 😊",
            "I'm great! Ready to help you with anything - from cooking recipes to finding nearby places! 💭",
            "I'm fantastic! What can I help you with today? ✨"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Thank you
    if (lowerMessage.match(/thank|thanks|appreciate/)) {
        const responses = [
            "You're very welcome! I'm always here to help. 💕",
            "My pleasure! Anything else you'd like to know? 📖",
            "Happy to help! Keep exploring and asking questions! 🌟"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Help
    if (lowerMessage.match(/help|what can you do|capabilities|features/)) {
        return "I can help you with:\n\n📊 **Journal Stats** - Count your echoes by type (mood, gratitude, memory)\n📍 **Your Location** - Tell you where you are right now\n📍 **Nearby Places** - Find cafes, restaurants, hospitals, banks, barbershops, and more near you\n🌤️ **Weather** - Check current weather conditions for any city\n💡 **General Knowledge** - Answer any question (recipes, tech facts, history, science, etc.)\n💬 **Friendly Chat** - Just talk to me about anything!\n\nWhat would you like help with? 🌟";
    }
    
    // Echo counting questions
    if (lowerMessage.includes('how many') || lowerMessage.includes('count') || lowerMessage.includes('total')) {
        if (lowerMessage.includes('echo') || lowerMessage.includes('journal') || lowerMessage.includes('entry')) {
            if (lowerMessage.includes('mood')) {
                return `You have ${echoStats.mood} mood echoes in your journal. That's wonderful self-awareness! Keep tracking your emotions. 💭`;
            } else if (lowerMessage.includes('gratitude')) {
                return `You've recorded ${echoStats.gratitude} gratitude echoes. Practicing gratitude is beautiful! 🙏`;
            } else if (lowerMessage.includes('memory')) {
                return `You have ${echoStats.memory} memory echoes saved. Cherish those precious moments! 📸`;
            } else {
                return `You have ${echoStats.total} total echoes in your journal. Great job documenting your journey! ✨`;
            }
        }
    }
    
    // Default friendly responses
    const defaultResponses = [
        `I'm Echo, your AI assistant! You have ${echoStats.total} journal entries. Ask me anything - recipes, tech facts, weather, nearby places, or help with your journal! 💫`,
        `How can I assist you today? I can answer general knowledge questions, find nearby places, check weather, or help with your journal stats! 📝`,
        `I'm here to help! You've written ${echoStats.total} echoes so far. Want to know something interesting or find a place near you? 🌟`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};
 
  
// MAIN EXPORT FUNCTION
exports.askAiAssistant = async (req, res) => {
    try {
        const { message, location } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Security check
        const forbiddenPatterns = ['hack', 'exploit', 'bypass', 'sql', 'inject', 'break', 'crack'];
        const isUnsafe = forbiddenPatterns.some(pattern => 
            message.toLowerCase().includes(pattern)
        );

        if (isUnsafe) {
            return res.json({ 
                text: "I'm sorry, I can only help with your Echo Stamp journal. Let's talk about your day instead!" 
            });
        }

        const userId = req.user._id;
        const echoStats = await getUserEchoStats(userId);

        // PRIORITY 0: Check CUSTOM KNOWLEDGE first (app creator, developer info, etc.)
      // PRIORITY 0: Check CUSTOM KNOWLEDGE first (app creator, developer info, etc.)
const customResponse = getCustomKnowledgeResponse(message, echoStats);
if (customResponse) {
    console.log("🎯 Custom knowledge response detected!");
    
    // Save to chat history
    let userChat = await Chat.findOne({ userId });
    const newUserMsg = { role: "user", parts: [{ text: message }] };
    const newBotMsg = { role: "model", parts: [{ text: customResponse }] };
    
    if (userChat) {
        userChat.messages.push(newUserMsg, newBotMsg);
        if (userChat.messages.length > 50) userChat.messages = userChat.messages.slice(-50);
        await userChat.save();
    } else {
        await Chat.create({ userId, messages: [newUserMsg, newBotMsg] });
    }
    
    return res.json({ text: customResponse, stats: echoStats, model_info: "custom-knowledge" });
}

// Add this helper function at the top of your file or inside getCustomKnowledgeResponse
function getCustomKnowledgeResponse(message, echoStats) {
    const lowerMsg = message.toLowerCase();
    
    // Creator / Developer info
 if (lowerMsg.includes("who created") || 
    lowerMsg.includes("who made") || 
    lowerMsg.includes("creator") || 
    lowerMsg.includes("developer") ||
    lowerMsg.includes("built this") ||
    lowerMsg.includes("build this app") ||
    lowerMsg.includes("who develop") ||
    lowerMsg.includes("who build") ||
    lowerMsg.includes("app creator") ||
    lowerMsg.includes("app developer") ||
    lowerMsg.includes("made this") ||
    lowerMsg.includes("created this") ||
    lowerMsg.includes("programmer") ||
    lowerMsg.includes("who coded") ||
    lowerMsg.includes("behind this app") ||
    lowerMsg.includes("owner of this app")) {
    
    return `✨ **About the Creator** ✨\n\n` +
           `This application was developed by **John Wilbert Gamis**, a dedicated solo developer from **Monbon, Irosin, Sorsogon**.\n\n` +
           `🏗️ **Development Journey**\n` +
           `John built this entire application from scratch, demonstrating exceptional skill and dedication as an independent developer. His vision and technical expertise have brought this project to life, handling everything from architecture and design to implementation and deployment.\n\n` +
           `💡 **Why This Matters**\n` +
           `As a solo developer, John takes pride in every line of code, ensuring quality, performance, and a seamless user experience. This app represents countless hours of problem-solving, learning, and passion for technology.\n\n` +
           `🤝 **Support & Feedback**\n` +
           `Have questions or suggestions? Your feedback helps John continue improving this platform. Every interaction supports independent development!`;
}
    
    
    return null;  
}
        // PRIORITY 1: Check for general knowledge queries - use Gemini with model stack
        if (isGeneralKnowledgeQuery(message)) {
            console.log("💡 General knowledge query detected, using Gemini with model stack...");
            const geminiResponse = await getGeminiResponse(message, echoStats, location);
            
            if (geminiResponse) {
                // Save to chat history
                let userChat = await Chat.findOne({ userId });
                const newUserMsg = { role: "user", parts: [{ text: message }] };
                const newBotMsg = { role: "model", parts: [{ text: geminiResponse }] };
                
                if (userChat) {
                    userChat.messages.push(newUserMsg, newBotMsg);
                    if (userChat.messages.length > 50) userChat.messages = userChat.messages.slice(-50);
                    await userChat.save();
                } else {
                    await Chat.create({ userId, messages: [newUserMsg, newBotMsg] });
                }
                
                return res.json({ text: geminiResponse, stats: echoStats, model_info: "gemini-general" });
            }
        }
        
        // PRIORITY 2: For location-specific queries, use fallback first (faster response)
        if (isNearbyQuery(message) || isAskingForLocation(message) || isAskingForWeather(message)) {
            console.log("📍 Location/Weather query detected, using fast fallback...");
            const fallbackResponse = await getFallbackResponse(message, echoStats, location);
            
            if (fallbackResponse && !fallbackResponse.includes("I'm Echo")) {
                // Save to chat history
                let userChat = await Chat.findOne({ userId });
                const newUserMsg = { role: "user", parts: [{ text: message }] };
                const newBotMsg = { role: "model", parts: [{ text: fallbackResponse }] };
                
                if (userChat) {
                    userChat.messages.push(newUserMsg, newBotMsg);
                    if (userChat.messages.length > 50) userChat.messages = userChat.messages.slice(-50);
                    await userChat.save();
                } else {
                    await Chat.create({ userId, messages: [newUserMsg, newBotMsg] });
                }
                
                return res.json({ text: fallbackResponse, stats: echoStats, model_info: "fallback" });
            }
        }
        
        // PRIORITY 3: For everything else (casual chat, other questions), use Gemini with model stack
        console.log("💬 Using Gemini with model stack for general response...");
        const geminiResponse = await getGeminiResponse(message, echoStats, location);
        
        if (geminiResponse) {
            // Save to chat history
            let userChat = await Chat.findOne({ userId });
            const newUserMsg = { role: "user", parts: [{ text: message }] };
            const newBotMsg = { role: "model", parts: [{ text: geminiResponse }] };
            
            if (userChat) {
                userChat.messages.push(newUserMsg, newBotMsg);
                if (userChat.messages.length > 50) userChat.messages = userChat.messages.slice(-50);
                await userChat.save();
            } else {
                await Chat.create({ userId, messages: [newUserMsg, newBotMsg] });
            }
            
            return res.json({ text: geminiResponse, stats: echoStats, model_info: "gemini" });
        }
        
        // ULTIMATE FALLBACK: If everything fails
        console.log("⚠️ All AI methods failed, using ultimate fallback");
        const finalFallback = await getFallbackResponse(message, echoStats, location);
        
        // Save to chat history
        let userChat = await Chat.findOne({ userId });
        const newUserMsg = { role: "user", parts: [{ text: message }] };
        const newBotMsg = { role: "model", parts: [{ text: finalFallback }] };
        
        if (userChat) {
            userChat.messages.push(newUserMsg, newBotMsg);
            if (userChat.messages.length > 50) userChat.messages = userChat.messages.slice(-50);
            await userChat.save();
        } else {
            await Chat.create({ userId, messages: [newUserMsg, newBotMsg] });
        }
        
        return res.json({ text: finalFallback, stats: echoStats, model_info: "fallback-final" });

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error.message);
        
        try {
            const userId = req.user?._id;
            if (userId) {
                const echoStats = await getUserEchoStats(userId);
                const fallbackText = "I'm having trouble connecting right now. Please try again in a moment. 🙏";
                
                // Save fallback message to history
                let userChat = await Chat.findOne({ userId });
                const newUserMsg = { role: "user", parts: [{ text: req.body?.message || "help" }] };
                const newBotMsg = { role: "model", parts: [{ text: fallbackText }] };
                
                if (userChat) {
                    userChat.messages.push(newUserMsg, newBotMsg);
                    await userChat.save();
                } else {
                    await Chat.create({ userId, messages: [newUserMsg, newBotMsg] });
                }
                
                return res.json({ text: fallbackText, fallback: true });
            }
        } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
        }
        
        res.status(500).json({ error: "I'm having trouble connecting. Please try again in a moment." });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const userChat = await Chat.findOne({ userId: req.user._id });
        res.json(userChat ? userChat.messages : []);
    } catch (err) {
        console.error("Get History Error:", err);
        res.status(500).json({ error: "Failed to load history" });
    }
};

exports.clearChatHistory = async (req, res) => {
    try {
        await Chat.findOneAndDelete({ userId: req.user._id });
        res.status(200).json({ message: "History cleared successfully." });
    } catch (err) {
        console.error("Clear History Error:", err);
        res.status(500).json({ error: "Failed to clear history." });
    }
};