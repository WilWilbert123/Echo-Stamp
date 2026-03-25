 
export const getCategoryMeta = (category, index, colors) => {
    const lowerCat = category.toLowerCase();
    let iconName = 'map';
    let iconColor = index % 2 === 0 ? colors.primary : '#F472B6';

    if (lowerCat.includes('city')) { iconName = 'business'; iconColor = '#94A3B8'; }
    else if (lowerCat.includes('food')) { iconName = 'restaurant'; iconColor = '#FB923C'; }
    else if (lowerCat.includes('cafe')) { iconName = 'cafe'; iconColor = '#A16207'; }
    else if (lowerCat.includes('hotel')) { iconName = 'bed'; iconColor = '#60A5FA'; }
    else if (lowerCat.includes('nature') || lowerCat.includes('park')) { iconName = 'leaf'; iconColor = '#4ADE80'; }
    else if (lowerCat.includes('museum')) { iconName = 'color-palette'; iconColor = '#A855F7'; }
    else if (lowerCat.includes('shopping')) { iconName = 'cart'; iconColor = '#EC4899'; }
    else if (lowerCat.includes('nightlife')) { iconName = 'beer'; iconColor = '#F43F5E'; }
    else if (lowerCat.includes('trending')) { iconName = 'flame'; }

    return { iconName, iconColor };
};

export const formatCoords = (item) => ({
    latitude: item.lat || item.latitude,
    longitude: item.lon || item.lng || item.longitude
});