import thisisit from "../../../../../config/config";

const GOOGLE_API_KEY = thisisit;

export const formatPlaces = (results) => {
    return results.map(place => {
        const photoReference = place.photos?.[0]?.photo_reference;
        const imageUrl = photoReference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`
            : 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800';

        return {
            id: place.place_id,
            name: place.name,
            rating: place.rating || 4.5,
            reviews: place.user_ratings_total || 120,
            address: place.formatted_address || place.vicinity,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            image: imageUrl,
            streetView: `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${place.geometry.location.lat},${place.geometry.location.lng}&heading=151.78&pitch=-0.76&key=${GOOGLE_API_KEY}`,
        };
    });
};

export const getSearchUrl = (query, token = null) => {
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`;
    if (token) url += `&pagetoken=${token}`;
    return url;
};