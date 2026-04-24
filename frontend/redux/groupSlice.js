import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../services/api';

export const getGroupsList = createAsyncThunk('groups/fetchAll', async () => {
    const response = await api.fetchGroups();
    return response.data;
});

export const createGroupAction = createAsyncThunk('groups/create', async (data) => {
    const response = await api.postGroup(data);
    return response.data;
});

export const getGroupHistory = createAsyncThunk('groups/history', async (groupId) => {
    const response = await api.fetchGroupMessages(groupId);
    return response.data;
});

export const sendGroupMessageAction = createAsyncThunk('groups/send', async (data) => {
    const response = await api.postGroupMessage(data);
    return response.data;
});

export const deleteGroupAction = createAsyncThunk('groups/delete', async (groupId) => {
    await api.removeGroup(groupId);
    return groupId;
});

export const deleteGroupMessageAction = createAsyncThunk('groups/deleteMessage', async ({ groupId, messageId }) => {
    await api.removeGroupMessage(groupId, messageId);
    return messageId;
});

export const editGroupMessageAction = createAsyncThunk('groups/editMessage', async ({ groupId, messageId, content }) => {
    const response = await api.updateGroupMessage(groupId, messageId, content);
    return response.data;
});

export const markGroupReadAction = createAsyncThunk(
    'groups/markRead',
    async (groupId, thunkAPI) => {
        await api.markGroupRead(groupId);
        return groupId;
    }
);

// Add Group Reaction Actions
export const addGroupReactionAction = createAsyncThunk(
    'groups/addReaction',
    async ({ groupId, messageId, emoji }, thunkAPI) => {
        try {
            const response = await api.addGroupMessageReaction(groupId, messageId, emoji);
            return { groupId, messageId, ...response.data };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const removeGroupReactionAction = createAsyncThunk(
    'groups/removeReaction',
    async ({ groupId, messageId }, thunkAPI) => {
        try {
            const response = await api.removeGroupMessageReaction(groupId, messageId);
            return { groupId, messageId, ...response.data };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

const groupSlice = createSlice({
    name: 'groups',
    initialState: {
        groups: [],
        activeGroupMessages: [],
        activeGroupId: null,
        loading: false,
    },
    reducers: {
        clearGroupChat: (state) => { 
            state.activeGroupMessages = []; 
            state.activeGroupId = null;
        },
        setActiveGroupId: (state, action) => {
            state.activeGroupId = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getGroupsList.pending, (state) => {
                state.loading = true;
            })
            .addCase(getGroupsList.fulfilled, (state, action) => {
                state.loading = false;
                // Enforce unreadCount 0 for the group we are currently looking at
                state.groups = action.payload.map(g => g._id === state.activeGroupId ? { ...g, unreadCount: 0 } : g);
            })
            .addCase(getGroupsList.rejected, (state) => {
                state.loading = false;
            })
            .addCase(getGroupHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(getGroupHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.activeGroupMessages = action.payload;
            })
            .addCase(getGroupHistory.rejected, (state) => {
                state.loading = false;
            })
            .addCase(sendGroupMessageAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(sendGroupMessageAction.fulfilled, (state, action) => {
                state.loading = false;
                state.activeGroupMessages.push(action.payload);
            })
            .addCase(sendGroupMessageAction.rejected, (state) => {
                state.loading = false;
            })
            .addCase(createGroupAction.fulfilled, (state, action) => {
                state.groups.unshift(action.payload);
            })
            .addCase(deleteGroupMessageAction.fulfilled, (state, action) => {
                state.activeGroupMessages = state.activeGroupMessages.filter(m => m._id !== action.payload);
            })
            .addCase(editGroupMessageAction.fulfilled, (state, action) => {
                const index = state.activeGroupMessages.findIndex(m => m._id === action.payload._id);
                if (index !== -1) {
                    state.activeGroupMessages[index] = action.payload;
                }
            })
            .addCase(markGroupReadAction.fulfilled, (state, action) => {
                const group = state.groups.find(g => g._id === action.payload);
                if (group) {
                    group.unreadCount = 0;
                }
            })
            .addCase(deleteGroupAction.fulfilled, (state, action) => {
                state.groups = state.groups.filter(g => g._id !== action.payload);
            })
            // Add Reaction Cases
            .addCase(addGroupReactionAction.fulfilled, (state, action) => {
                const { messageId, reactions } = action.payload;
                const message = state.activeGroupMessages.find(m => m._id === messageId);
                if (message) {
                    message.reactions = reactions;
                }
            })
            .addCase(removeGroupReactionAction.fulfilled, (state, action) => {
                const { messageId, reactions } = action.payload;
                const message = state.activeGroupMessages.find(m => m._id === messageId);
                if (message) {
                    message.reactions = reactions;
                }
            });
    }
});

export const { clearGroupChat, setActiveGroupId } = groupSlice.actions;
export default groupSlice.reducer;