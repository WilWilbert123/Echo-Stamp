import axios from 'axios';

const API = axios.create({
   //baseURL: 'http://192.168.0.223:5000/api', 
   baseURL: 'https://echo-stamp.onrender.com/api',
    timeout: 60000,
});

 
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

export const fetchEchoes = (userId, type) => API.get(`/echoes/${userId}/${type}`);
export const postEcho = (echoData) => API.post('/echoes', echoData);
export const deleteEcho = (id) => API.delete(`/echoes/${id}`);


// --- 3. Journals (Private Atlas Entries) ---
 
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

// --- Security & 2FA ---
export const updateSecurity = (data) => API.post('/users/update-security', data);
export const verify2faLogin = (data) => API.post('/users/login-2fa-verify', data);

// ---- delete account ----
export const fullDeleteAccount = () => API.delete('/users/full-delete');
 
/* --- AI Chat Assistant --- */
export const askAiAssistant = (message, coords = null) => 
    API.post('/chat/ai-assistant', { 
        message, 
        location: coords  
    });

export const fetchChatHistory = () => API.get('/chat/history');
export const clearChatHistory = () => API.delete('/chat/history');


/* --- Events (Community Gatherings) --- */
export const hostMeetup = (eventData) => API.post('/events/host', eventData);
export const toggleJoinEvent = (eventId) => API.post(`/events/join/${eventId}`);
export const deleteEventAPI = (eventId) => API.delete(`/events/${eventId}`);
export const getAllEvents = () => API.get('/events');

// --- Privacy & Visibility ---
export const updatePrivacy = (data) => API.patch('/users/update-privacy', data);


// --- Updated fetchGlobalFeed ---
export const fetchGlobalFeed = (userId) => {  const url = userId ? `/journals/global?userId=${userId}` : '/journals/global'; return API.get(url);};

// messages
export const fetchMessages = (userId) => API.get(`/messages/${userId}`);
export const postMessage = (messageData) => API.post('/messages', messageData);
export const fetchConversations = () => API.get('/messages/conversations');
export const removeConversation = (otherUserId) => API.delete(`/messages/conversations/${otherUserId}`);
export const updateMessage = (id, content) => API.patch(`/messages/${id}`, { content });
export const removeMessage = (id) => API.delete(`/messages/${id}`);

// Optional: Mark messages as read
export const markAsRead = (otherUserId) => API.put(`/messages/read/${otherUserId}`);

 //fetch all user
 export const fetchAllUsers = () => API.get('/users/all');

export const Config = { MAPS_SDK_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_SDK_KEY, PLACES_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,};

export default API;
