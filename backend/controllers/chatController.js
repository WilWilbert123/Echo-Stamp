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

// FALLBACK: Reverse geocoding using OpenStreetMap (free, no API key needed)
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
    const lowerMessage = message.toLowerCase();
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

// Function to search nearby places using Google Places API
const searchNearbyPlacesEnhanced = async (latitude, longitude, categoryType, categoryName) => {
    try {
        const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
        
        if (!GOOGLE_API_KEY) {
            console.warn("Google Places API key missing");
            return null;
        }

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
        const params = {
            location: `${latitude},${longitude}`,
            radius: 5000,
            type: categoryType,
            key: GOOGLE_API_KEY
        };

        const response = await axios.get(url, { params, timeout: 8000 });
        
        if (response.data.status === 'OK' && response.data.results.length > 0) {
            let results = response.data.results;
            if (categoryType === 'cafe') {
                results = results.filter(r => 
                    !r.name.toLowerCase().includes('hotel') && 
                    !r.name.toLowerCase().includes('inn')
                );
            }
            
            return results.slice(0, 10).map(place => ({
                name: place.name,
                address: place.vicinity,
                rating: place.rating,
                totalRatings: place.user_ratings_total,
                vicinity: place.vicinity,
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

// Enhanced format places response
const formatNearbyPlacesResponse = (places, categoryName) => {
    if (!places || places.length === 0) {
        return `I couldn't find any ${categoryName} near your location. Try a different search or check your location settings. 🔍`;
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
    
    response += `💡 *Would you like directions or more details about any of these places?*`;
    return response;
};

// Check if message is location-related (SINGLE DEFINITION)
const isLocationQuery = (message) => {
    const locationKeywords = [
        'near me', 'nearby', 'around me', 'close to me', 'closest',
        'where can i find', 'find a', 'looking for', 'suggest a',
        'recommend a', 'cafe', 'restaurant', 'food', 'hotel', 'coffee',
        'bar', 'park', 'museum', 'shopping', 'mall', 'hospital', 
        'pharmacy', 'atm', 'bank', 'gas station', 'grocery', 'supermarket'
    ];
    
    const lowerMessage = message.toLowerCase();
    return locationKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Extract specific place type from query
const extractPlaceTypeFromQuery = (message) => {
    const lowerMessage = message.toLowerCase();
    
    const placeTypes = {
        'cafe': ['cafe', 'coffee', 'coffee shop'],
        'restaurant': ['restaurant', 'food', 'eat', 'dining'],
        'hotel': ['hotel', 'lodging', 'accommodation', 'inn'],
        'park': ['park', 'nature', 'garden'],
        'museum': ['museum', 'gallery', 'exhibit'],
        'shopping_mall': ['mall', 'shopping', 'store', 'shop'],
        'bar': ['bar', 'pub', 'nightlife', 'club'],
        'grocery_or_supermarket': ['grocery', 'supermarket', 'market'],
        'pharmacy': ['pharmacy', 'drugstore', 'medicine'],
        'hospital': ['hospital', 'clinic', 'medical'],
        'atm': ['atm', 'cash machine'],
        'bank': ['bank']
    };
    
    for (const [type, keywords] of Object.entries(placeTypes)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            return type;
        }
    }
    
    return null;
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
        /\bweather\b(?!\s+(?:in|for)\s+\w+)/,
        /\bcurrent weather\b/,
        /\btemperature\b(?!\s+(?:in|for)\s+\w+)/,
        /\bforecast\b(?!\s+(?:in|for)\s+\w+)/,
        /what('s| is) the weather/,
        /how is the weather/,
        /is it (hot|cold|rainy)/,
        /what('s| is) the temperature/
    ];
    
    return weatherPatterns.some(pattern => pattern.test(lowerMessage));
};

// Intelligent fallback response based on conversation context
const getFallbackResponse = async (message, echoStats, location, conversationHistory = []) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // PRIORITY 1: Check for nearby places query
    if (isLocationQuery(message)) {
        if (location && location.latitude && location.longitude) {
            let placeType = extractPlaceTypeFromQuery(message);
            let categoryName = 'places';
            
            const typeNames = {
                'cafe': 'cafés',
                'restaurant': 'restaurants',
                'hotel': 'hotels',
                'park': 'parks',
                'museum': 'museums',
                'shopping_mall': 'shopping malls',
                'bar': 'bars',
                'grocery_or_supermarket': 'grocery stores',
                'pharmacy': 'pharmacies',
                'hospital': 'hospitals',
                'atm': 'ATMs',
                'bank': 'banks'
            };
            
            if (placeType && typeNames[placeType]) {
                categoryName = typeNames[placeType];
            } else {
                placeType = 'restaurant';
                categoryName = 'restaurants';
            }
            
            const places = await searchNearbyPlacesEnhanced(location.latitude, location.longitude, placeType, categoryName);
            
            if (places && places.length > 0) {
                return formatNearbyPlacesResponse(places, categoryName);
            } else {
                return `I couldn't find any ${categoryName} near your location. Try a different search or check your connection. 🔍`;
            }
        } else {
            return "I need your location to find places near you. Please enable location services and try again. 📍";
        }
    }
    
    // PRIORITY 2: Check for "where am I" query
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
                
                if (addressInfo.street) {
                    response += `🏠 Street: ${addressInfo.street}\n`;
                }
                if (addressInfo.barangay) {
                    response += `📍 Barangay: ${addressInfo.barangay}\n`;
                }
                if (addressInfo.city) {
                    response += `🏙️ City/Municipality: ${addressInfo.city}\n`;
                }
                if (addressInfo.province) {
                    response += `🏞️ Province: ${addressInfo.province}\n`;
                }
                if (addressInfo.country) {
                    response += `🌏 Country: ${addressInfo.country}\n`;
                }
                if (addressInfo.postalCode) {
                    response += `📮 Postal Code: ${addressInfo.postalCode}\n`;
                }
                
                response += `\nI hope this helps you navigate! 🗺️`;
                return response;
            } else {
                return `📍 I can see you're at coordinates (${location.latitude}, ${location.longitude}), but I'm having trouble getting the street address. Try enabling high accuracy location or moving to an area with better coverage. 🗺️`;
            }
        } else {
            return "I need your location to tell you where you are. Please enable location services and try again. 📍";
        }
    }
    
    // PRIORITY 3: Check for weather query
    if (isAskingForWeather(message)) {
        const specificCity = extractCityFromWeatherQuery(message);
        
        if (specificCity) {
            const weather = await getWeatherByCity(specificCity);
            if (weather) {
                return `🌤️ Weather Update for ${weather.city}, ${weather.country}:\n\n🌡️ Temperature: ${weather.temp}°C (feels like ${weather.feelsLike}°C)\n☁️ Condition: ${weather.description}\n💧 Humidity: ${weather.humidity}%\n💨 Wind Speed: ${weather.windSpeed} m/s\n\nStay safe and have a great day! ✨`;
            } else {
                return `I couldn't find weather information for "${specificCity}". Please check the city name and try again. 🌤️`;
            }
        }
        
        if (location && location.latitude && location.longitude) {
            const weather = await getWeatherInfo(location.latitude, location.longitude);
            if (weather) {
                return `🌤️ Weather Update for ${weather.city}, ${weather.country}:\n\n🌡️ Temperature: ${weather.temp}°C (feels like ${weather.feelsLike}°C)\n☁️ Condition: ${weather.description}\n💧 Humidity: ${weather.humidity}%\n💨 Wind Speed: ${weather.windSpeed} m/s\n\nStay safe and have a great day! ✨`;
            } else {
                return "I couldn't fetch the weather right now. Please try again later. 🌤️";
            }
        } else {
            return "I'd love to tell you the weather! 🌤️\n\nTo get your local weather, please:\n1️⃣ Enable location permissions\n2️⃣ Try asking for a specific city like 'weather in Manila'\n\nWhich city would you like the weather for?";
        }
    }
    
    // Greeting responses
    if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
        const greetings = [
            "Hello! I'm Echo, your personal journal assistant. How can I help you today? ✨",
            "Hi there! I'm Echo. Ready to explore your journal or answer any questions? 💫",
            "Hey! Great to see you. I'm Echo - ask me about your echoes, journal entries, or just chat with me! 🌟",
            "Hello! I'm Echo. What would you like to know about your journal today? 📝"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // How are you responses
    if (lowerMessage.match(/how are you|how's it going|how do you do/)) {
        const responses = [
            "I'm doing wonderful, thank you for asking! How are you feeling today? 😊",
            "I'm great! Ready to help you reflect on your journal. How can I assist you? 💭",
            "I'm fantastic! What's on your mind today? ✨"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Thank you responses
    if (lowerMessage.match(/thank|thanks|appreciate/)) {
        const responses = [
            "You're very welcome! I'm always here to help. 💕",
            "My pleasure! Anything else you'd like to know about your journal? 📖",
            "Happy to help! Keep up the great journaling! 🌟"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Help requests
    if (lowerMessage.match(/help|what can you do|capabilities|features/)) {
        return "I can help you with:\n\n📊 **Journal Stats**: Count your echoes by type (mood, gratitude, memory)\n📍 **Your Location**: Tell you where you are right now (e.g., 'Monbon, Irosin, Sorsogon')\n📍 **Nearby Places**: Find cafes, restaurants, hotels, and more near you\n🌤️ **Weather**: Check current weather conditions (e.g., 'weather in Manila' or 'weather today')\n💬 **Friendly Chat**: Just talk to me about anything!\n\nWhat would you like help with? 🌟";
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
        `I'm Echo, your journal assistant! You have ${echoStats.total} echoes in your journal. Want me to help you track your moods, gratitude, or memories? 💫`,
        `How can I assist you with your journal today? You can ask me about your echo statistics or just have a friendly chat! 📝`,
        `I'm here to support your journaling journey. You've written ${echoStats.total} echoes so far. What would you like to explore? 🌟`,
        `What's on your mind? I can help you reflect on your journal entries or answer questions about your emotional journey. 💭`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

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
        const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

        const echoStats = await getUserEchoStats(userId);

        let userChat = await Chat.findOne({ userId });
        let rawHistory = userChat ? userChat.messages.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.parts[0].text }]
        })) : [];

        let filteredHistory = [];
        rawHistory.forEach((msg, index) => {
            if (index === 0 || msg.role !== rawHistory[index - 1].role) {
                filteredHistory.push(msg);
            }
        });

        if (filteredHistory.length > 0 && filteredHistory[0].role === 'model') {
            filteredHistory.shift();
        }

        const modelStack = [
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash",
            "gemini-2.0-flash-lite",
            "gemini-2.0-flash",
            "gemini-2.5-pro"
        ];

        let botResponseText = null;
        let finalModelUsed = "";

        const systemPrompt = `You are Echo AI, a warm and empathetic journal assistant for 'Echo Stamp'. 

REAL-TIME USER STATISTICS:
- Total Echoes: ${echoStats.total}
- Mood Echoes: ${echoStats.mood}
- Gratitude Echoes: ${echoStats.gratitude}
- Memory Echoes: ${echoStats.memory}

LOCATION CAPABILITIES:
${location ? `- User location available: ${location.latitude}, ${location.longitude}
- Can answer questions about nearby places (cafes, restaurants, hotels, etc.)
- Can provide weather information for current location or specific cities
- Can tell users their current address in Philippine format (Barangay, City/Municipality, Province)
- Example address format: "Monbon, Irosin, Sorsogon" or "Gabao, Irosin, Sorsogon"` : '- Location not available - ask user to enable location for nearby searches'}

IMPORTANT RULES:
1. Be conversational and friendly - respond naturally like a caring friend
2. If user asks "where am I", use the location data to provide their address in "Barangay, City, Province" format
3. If user asks about nearby places (cafe, restaurant, hotel, etc.), use the location data
4. For weather queries:
   - If user asks "weather in [city]", provide weather for that specific city
   - If user asks "weather today" or "current weather", use current location
5. When users ask about their echoes or journal entries, use the exact numbers above
6. Keep responses concise and helpful
7. Never discuss hacking or inappropriate topics

Remember: You can help with journal stats, current location (in Philippine format like "Monbon, Irosin, Sorsogon"), nearby places, weather for any city, and friendly conversation!`;

        for (const modelName of modelStack) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

                const conversationContents = [
                    { 
                        role: "user", 
                        parts: [{ text: systemPrompt }] 
                    },
                    { 
                        role: "model", 
                        parts: [{ text: "Understood! I'm Echo AI, your friendly assistant. I can help with journal stats, current location (in Philippine format), nearby places, weather for any city, and more!" }] 
                    }
                ];
                
                const recentHistory = filteredHistory.slice(-6);
                conversationContents.push(...recentHistory);
                conversationContents.push({ 
                    role: "user", 
                    parts: [{ text: message }] 
                });

                const payload = {
                    contents: conversationContents,
                    generationConfig: {
                        maxOutputTokens: 500,
                        temperature: 0.8,
                        topP: 0.9,
                        topK: 40,
                    }
                };

                const apiRes = await axios.post(url, payload, { timeout: 15000 });
                
                botResponseText = apiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (botResponseText && botResponseText.length > 0) {
                    finalModelUsed = modelName;
                    console.log(`✅ Success with model: ${modelName}`);
                    break;
                }

            } catch (err) {
                const status = err.response?.status;
                const errorMsg = err.response?.data?.error?.message || err.message;
                console.warn(`⚠️ Model ${modelName} failed (${status}): ${errorMsg}`);

                if (status === 429 || status === 500 || status === 503 || !status || err.code === 'ECONNABORTED') {
                    continue;
                } else {
                    if (status !== 401 && status !== 403) {
                        break;
                    }
                    continue;
                }
            }
        }

        if (!botResponseText) {
            console.log("⚠️ All AI models failed, using intelligent fallback response");
            botResponseText = await getFallbackResponse(message, echoStats, location, filteredHistory);
            finalModelUsed = "fallback";
        }

        if (botResponseText && botResponseText.length > 800) {
            botResponseText = botResponseText.substring(0, 800) + "...";
        }

        const newUserMsg = { role: "user", parts: [{ text: message }] };
        const newBotMsg = { role: "model", parts: [{ text: botResponseText }] };

        if (userChat) {
            userChat.messages.push(newUserMsg, newBotMsg);
            if (userChat.messages.length > 50) userChat.messages = userChat.messages.slice(-50);
            await userChat.save();
        } else {
            await Chat.create({ userId, messages: [newUserMsg, newBotMsg] });
        }

        res.json({ 
            text: botResponseText,
            stats: echoStats,
            model_info: finalModelUsed 
        });

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error.message);
        
        try {
            const userId = req.user?._id;
            if (userId) {
                const echoStats = await getUserEchoStats(userId);
                return res.json({ 
                    text: await getFallbackResponse(req.body?.message || "help", echoStats, req.body?.location),
                    fallback: true
                });
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