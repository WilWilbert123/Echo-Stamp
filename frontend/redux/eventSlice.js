import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAllEvents, hostMeetup } from '../services/api';

// FETCH ALL EVENTS  
export const fetchAllEvents = createAsyncThunk(
    'events/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
        
            const response = await getAllEvents();
            return response.data; 
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch events");
        }
    }
);

// CREATE EVENT
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
        allEvents: [],  
        isLoading: false,
        isPosting: false,
        error: null 
    },
    reducers: {
         
        clearEvents: (state) => {
            state.allEvents = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle Fetching
            .addCase(fetchAllEvents.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllEvents.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allEvents = action.payload;  
            })
            .addCase(fetchAllEvents.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            
            .addCase(createCommunityMeetup.pending, (state) => {
                state.isPosting = true;
            })
            .addCase(createCommunityMeetup.fulfilled, (state, action) => {
                state.isPosting = false;
                
                state.allEvents.unshift(action.payload);  
            })
            .addCase(createCommunityMeetup.rejected, (state, action) => {
                state.isPosting = false;
                state.error = action.payload;
            });
    }
});

export const { clearEvents } = eventSlice.actions;
export default eventSlice.reducer;