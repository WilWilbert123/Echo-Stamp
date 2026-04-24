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

export const getConversationsList = createAsyncThunk(
    'messages/getConversations',
    async (_, thunkAPI) => {
        try {
            const response = await messageService.fetchConversations();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || "Error fetching conversations");
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

export const editMessageAction = createAsyncThunk(
    'messages/edit',
    async ({ messageId, content }, thunkAPI) => {
        try {
            const response = await messageService.updateMessage(messageId, content);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const deleteMessageAction = createAsyncThunk(
    'messages/delete',
    async (messageId, thunkAPI) => {
        try {
            await messageService.removeMessage(messageId);
            return messageId;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const deleteConversationAction = createAsyncThunk(
    'messages/deleteConversation',
    async (otherUserId, thunkAPI) => {
        try {
            await messageService.removeConversation(otherUserId);
            return otherUserId;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || "Error deleting conversation");
        }
    }
);

export const markAsReadAction = createAsyncThunk(
    'messages/markRead',
    async (otherUserId, thunkAPI) => {
        try {
            await messageService.markAsRead(otherUserId);
            return otherUserId;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Add these thunks to your messageSlice.js

export const addReactionAction = createAsyncThunk(
    'messages/addReaction',
    async ({ messageId, emoji }, thunkAPI) => {
        try {
            const response = await messageService.addMessageReaction(messageId, emoji);
            return { messageId, ...response.data };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Add this thunk to your messageSlice.js
export const removeReactionAction = createAsyncThunk(
    'messages/removeReaction',
    async (messageId, thunkAPI) => {
        try {
            const response = await messageService.removeMessageReaction(messageId);
            return { messageId, ...response.data };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);



const messageSlice = createSlice({
    name: 'messages',
    initialState: {
        activeConversation: [],
        conversations: [],
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
                state.activeConversation = action.payload.messages;
            })
            // Get Conversations List
            .addCase(getConversationsList.pending, (state) => {
                state.loading = true;
            })
            .addCase(getConversationsList.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations = action.payload;
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
            })
            // Edit Message
            .addCase(editMessageAction.fulfilled, (state, action) => {
                const index = state.activeConversation.findIndex(m => m._id === action.payload._id);
                if (index !== -1) state.activeConversation[index] = action.payload;
            })
            // Delete Message
            .addCase(deleteMessageAction.fulfilled, (state, action) => {
                state.activeConversation = state.activeConversation.filter(m => m._id !== action.payload);
            })
            // Mark as Read
            .addCase(markAsReadAction.fulfilled, (state, action) => {
                const conv = state.conversations.find(c => c._id === action.payload);
                if (conv) {
                    conv.unreadCount = 0;
                }
            })
            // Delete Entire Conversation
            .addCase(deleteConversationAction.fulfilled, (state, action) => {
                state.conversations = state.conversations.filter(c => c._id !== action.payload);
            })


            .addCase(addReactionAction.fulfilled, (state, action) => {
                const { messageId, reactions } = action.payload;
                const message = state.activeConversation.find(m => m._id === messageId);
                if (message) {
                    message.reactions = reactions;
                }
            })
            .addCase(removeReactionAction.fulfilled, (state, action) => {
                const { messageId, reactions } = action.payload;
                const message = state.activeConversation.find(m => m._id === messageId);
                if (message) {
                    message.reactions = reactions;
                }
            })
    },
});





export const { clearChat, addLocalMessage } = messageSlice.actions;
export default messageSlice.reducer;