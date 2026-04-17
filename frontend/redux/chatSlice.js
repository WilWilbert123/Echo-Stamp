import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        history: [],
        loading: false,
        error: null,
        currentLocation: null,
        echoStats: {
            total: 0,
            mood: 0,
            gratitude: 0,
            memory: 0
        }
    },
    reducers: {
        setHistory: (state, action) => {
            state.history = action.payload;
        },
        addMessage: (state, action) => {
            state.history.push(action.payload);
        },
        clearHistory: (state) => {
            state.history = [];
            state.loading = false;
        },
        setChatLoading: (state, action) => {
            state.loading = action.payload;
        },
        updateChatLocation: (state, action) => {
            state.currentLocation = action.payload;
        },
        setEchoStats: (state, action) => {
            state.echoStats = action.payload;
        }
    },
});

export const { 
    setHistory, 
    addMessage, 
    clearHistory, 
    setChatLoading, 
    updateChatLocation,
    setEchoStats
} = chatSlice.actions;

export default chatSlice.reducer;