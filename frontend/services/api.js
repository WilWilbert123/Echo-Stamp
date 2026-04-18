import axios from 'axios';
const API = axios.create({
   //baseURL: 'http://192.168.0.223:10000/api', 
   baseURL: 'https://echo-stamp.onrender.com/api',
    timeout: 60000,
});
 
// Track retry counts per endpoint
const retryCounts = new Map();

// Response interceptor with exponential backoff
API.interceptors.response.use(
  (response) => {
    const key = response.config.url;
    retryCounts.delete(key);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest.url;
    
    let retryCount = retryCounts.get(url) || 0;
    
    if (error.response?.status === 429 && retryCount < 3) {
      retryCount++;
      retryCounts.set(url, retryCount);
      
      const delay = Math.min(3000 * Math.pow(2, retryCount - 1), 15000);
      console.log(`Rate limited. Retry ${retryCount}/${3} after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return API(originalRequest);
    }
    
    retryCounts.delete(url);
    return Promise.reject(error);
  }
);

API.interceptors.request.use(
    async (config) => {
        try {
            const { store } = await import('../redux/store');
            const state = store.getState();
            const token = state.auth?.token; 

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Auth Interceptor Error:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/* --- API Endpoints --- */

export const login = (data) => API.post('/users/login', data);
export const register = (data) => API.post('/users/register', data);

/* --- echo --- */

export const fetchGlobalEchoes = () => API.get('/echoes/feed/global');
export const fetchEchoes = (userId, type) => API.get(`/echoes/${userId}/${type}`);
export const postEcho = (echoData) => API.post('/echoes', echoData);
export const deleteEcho = (id) => API.delete(`/echoes/${id}`);
export const likeEcho = (id, userId) => API.post(`/echoes/${id}/like`, { userId });
export const commentEcho = (id, data) => API.post(`/echoes/${id}/comment`, data);
export const replyToEchoComment = (id, commentId, data) => API.post(`/echoes/${id}/comment/${commentId}/reply`, data);
export const deleteEchoComment = (id, commentId) => API.delete(`/echoes/${id}/comment/${commentId}`);

// ADD THIS FUNCTION - Count user echoes
export const countMyEchoes = (type = null) => {
    const url = type ? `/echoes/count/my?type=${type}` : '/echoes/count/my';
    return API.get(url);
};

/* --- Journals --- */
export const fetchJournals = (userId) => API.get(`/journals/${userId}`);
export const removeMediaFromJournal = (id, mediaUri) => API.patch(`/journals/${id}/media`, { mediaUri });
export const postJournal = (journalData) => API.post('/journals', journalData);
export const deleteJournal = (id) => API.delete(`/journals/${id}`);
export const likeJournal = (id) => API.post(`/journals/${id}/like`);
export const commentJournal = (id, text) => API.post(`/journals/${id}/comment`, { text });
export const replyToComment = (id, commentId, text) => API.post(`/journals/${id}/comment/${commentId}/reply`, { text });
export const updateComment = (id, commentId, text) => API.patch(`/journals/${id}/comment/${commentId}`, { text });
export const removeComment = (id, commentId) => API.delete(`/journals/${id}/comment/${commentId}`);
export const updateReply = (id, commentId, replyId, text) => API.patch(`/journals/${id}/comment/${commentId}/reply/${replyId}`, { text });

export const requestOtp = (userData) => API.post('/users/request-otp', userData);
export const verifyOtp = (data) => API.post('/users/verify-otp', data);
 
export const forgotPassword = (email) => API.post('/users/forgot-password', { email });
export const resetPassword = (data) => API.post('/users/reset-password', data);

export const updateSecurity = (data) => API.post('/users/update-security', data);
export const verify2faLogin = (data) => API.post('/users/login-2fa-verify', data);

export const fullDeleteAccount = () => API.delete('/users/full-delete');
 
/* --- AI Chat Assistant --- */
export const askAiAssistant = (message, coords = null) => 
    API.post('/chat/ai-assistant', { 
        message, 
        location: coords  
    });

export const fetchChatHistory = () => API.get('/chat/history');
export const clearChatHistory = () => API.delete('/chat/history');

/* --- Events --- */
export const hostMeetup = (eventData) => API.post('/events/host', eventData);
export const toggleJoinEvent = (eventId) => API.post(`/events/join/${eventId}`);
export const deleteEventAPI = (eventId) => API.delete(`/events/${eventId}`);
export const getAllEvents = () => API.get('/events');

export const updatePrivacy = (data) => API.patch('/users/update-privacy', data);
export const updateProfile = (data) => API.patch('/users/update-profile', data);

export const fetchGlobalFeed = (userId) => {  
    const url = userId ? `/journals/global?userId=${userId}` : '/journals/global'; 
    return API.get(url);
};

export const fetchMessages = (userId) => API.get(`/messages/${userId}`);
export const postMessage = (messageData) => API.post('/messages', messageData);
export const fetchConversations = () => API.get('/messages/conversations');
export const removeConversation = (otherUserId) => API.delete(`/messages/conversations/${otherUserId}`);
export const updateMessage = (id, content) => API.patch(`/messages/${id}`, { content });
export const removeMessage = (id) => API.delete(`/messages/${id}`);
export const shareLocationBulk = (data) => API.post('/messages/share-location', data);

export const startLiveShare = (data) => API.post('/share-location/start', data);
export const stopLiveShare = () => API.post('/share-location/stop');
export const updateLiveLocation = (data) => API.post('/share-location/update', data);
export const fetchActiveShares = () => API.get('/share-location/active');
export const fetchMyOutgoingShare = () => API.get('/share-location/my-status');

export const postGroup = (groupData) => API.post('/groups', groupData);
export const fetchGroups = () => API.get('/groups');
export const fetchGroupMessages = (groupId) => API.get(`/groups/${groupId}`);
export const postGroupMessage = (data) => API.post('/groups/message', data);
export const removeGroup = (groupId) => API.delete(`/groups/${groupId}`);
export const removeGroupMessage = (groupId, messageId) => API.delete(`/groups/${groupId}/message/${messageId}`);
export const updateGroupMessage = (groupId, messageId, content) => API.patch(`/groups/${groupId}/message/${messageId}`, { content });
export const markGroupRead = (groupId) => API.put(`/groups/read/${groupId}`);

export const markAsRead = (otherUserId) => API.put(`/messages/read/${otherUserId}`);

export const fetchAllUsers = () => API.get('/users/all');

export const fetchNotifications = () => API.get('/notifications');
export const markNotificationsRead = () => API.patch('/notifications/read');
export const markNotificationsUnread = () => API.patch('/notifications/unread');
export const clearNotifications = () => API.delete('/notifications');
export const removeNotification = (id) => API.delete(`/notifications/${id}`);

export const Config = { 
    MAPS_SDK_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_SDK_KEY, 
    PLACES_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
};

export default API;