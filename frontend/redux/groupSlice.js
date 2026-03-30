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

export const markGroupReadAction = createAsyncThunk(
    'groups/markRead',
    async (groupId, thunkAPI) => {
        await api.markGroupRead(groupId);
        return groupId;
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
            .addCase(getGroupsList.fulfilled, (state, action) => {
                // Enforce unreadCount 0 for the group we are currently looking at
                state.groups = action.payload.map(g => g._id === state.activeGroupId ? { ...g, unreadCount: 0 } : g);
            })
            .addCase(getGroupHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(getGroupHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.activeGroupMessages = action.payload;
            })
            .addCase(sendGroupMessageAction.fulfilled, (state, action) => {
                state.activeGroupMessages.push(action.payload);
            })
            .addCase(createGroupAction.fulfilled, (state, action) => {
                state.groups.unshift(action.payload);
            })
            .addCase(markGroupReadAction.fulfilled, (state, action) => {
                const group = state.groups.find(g => g._id === action.payload);
                if (group) {
                    group.unreadCount = 0;
                }
            })
            .addCase(deleteGroupAction.fulfilled, (state, action) => {
                state.groups = state.groups.filter(g => g._id !== action.payload);
            });
    }
});

export const { clearGroupChat, setActiveGroupId } = groupSlice.actions;
export default groupSlice.reducer;