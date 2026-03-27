import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as messageService from '../services/api';

// Async thunk to get chat history
export const getChatHistory = createAsyncThunk(
    'messages/getHistory',
    async (userId, thunkAPI) => {
        try {
            const response = await messageService.fetchMessages(userId);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Async thunk to send a message
export const sendMessageAction = createAsyncThunk(
    'messages/send',
    async (messageData, thunkAPI) => {
        try {
            const response = await messageService.postMessage(messageData);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

const messageSlice = createSlice({
    name: 'messages',
    initialState: {
        activeConversation: [],
        loading: false,
        sending: false,
        error: null,
    },
    reducers: {
        clearChat: (state) => {
            state.activeConversation = [];
        },
        // Optimistic UI update: add message to list before server responds
        addLocalMessage: (state, action) => {
            state.activeConversation.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            // Get History
            .addCase(getChatHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(getChatHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.activeConversation = action.payload;
            })
            // Send Message
            .addCase(sendMessageAction.pending, (state) => {
                state.sending = true;
            })
            .addCase(sendMessageAction.fulfilled, (state, action) => {
                state.sending = false;
                // If the message isn't already there from an optimistic update
                const exists = state.activeConversation.find(m => m._id === action.payload._id);
                if (!exists) state.activeConversation.push(action.payload);
            });
    },
});

export const { clearChat, addLocalMessage } = messageSlice.actions;
export default messageSlice.reducer;