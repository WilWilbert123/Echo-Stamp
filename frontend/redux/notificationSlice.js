import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../services/api';

export const getNotificationsAsync = createAsyncThunk('notifications/fetch', async () => {
    const response = await api.fetchNotifications();
    return response.data;
});

export const markAllReadAsync = createAsyncThunk('notifications/markRead', async () => {
    await api.markNotificationsRead();
    return true;
});

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: { list: [], unreadCount: 0, loading: false },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getNotificationsAsync.fulfilled, (state, action) => {
                state.list = action.payload;
                state.unreadCount = action.payload.filter(n => !n.isRead).length;
                state.loading = false;
            })
            .addCase(markAllReadAsync.fulfilled, (state) => {
                state.list = state.list.map(n => ({ ...n, isRead: true }));
                state.unreadCount = 0;
            });
    }
});

export default notificationSlice.reducer;
