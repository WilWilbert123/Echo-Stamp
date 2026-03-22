import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        history: [],
        loading: false,
        error: null,
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
        }
    },
});

export const { setHistory, addMessage, clearHistory, setChatLoading } = chatSlice.actions;
export default chatSlice.reducer;