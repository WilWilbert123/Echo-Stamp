import axios from 'axios';

const API = axios.create({
    baseURL: 'http://192.168.0.223:5000/api', 
    timeout: 10000,
});

// Interceptor to add Auth Token to every request
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


export default API;
