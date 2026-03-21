import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { hostMeetup } from '../services/api';

export const createCommunityMeetup = createAsyncThunk(
    'events/create',
    async (eventData, { rejectWithValue }) => {
        try {
         
            const response = await hostMeetup(eventData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to host meetup");
        }
    }
);

const eventSlice = createSlice({
    name: 'events',
    initialState: { 
        list: [], 
        loading: false,
        error: null 
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createCommunityMeetup.pending, (state) => {
                state.loading = true;
            })
            .addCase(createCommunityMeetup.fulfilled, (state, action) => {
                state.loading = false;
                state.list.unshift(action.payload);  
            })
            .addCase(createCommunityMeetup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default eventSlice.reducer;