export const checkIsVideo = (uri) => {
    if (!uri || typeof uri !== 'string') return false;
    const url = uri.toLowerCase();
    return (
        url.includes('/video/upload/') || 
        url.endsWith('.mp4') || 
        url.endsWith('.mov') || 
        url.endsWith('.m4v')
    );
};

export const getRelativeTime = (date) => {
    try {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return past.toLocaleDateString();
    } catch (e) {
        return 'Recently';
    }
};