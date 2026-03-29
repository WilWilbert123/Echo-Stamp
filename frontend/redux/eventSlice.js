import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deleteEventAPI, getAllEvents, hostMeetup, toggleJoinEvent } from '../services/api';

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

export const joinEventAsync = createAsyncThunk(
    'events/join',
    async (eventId, { rejectWithValue }) => {
        try {
            const response = await toggleJoinEvent(eventId);
            return response.data;
        } catch (err) { return rejectWithValue(err.response?.data); }
    }
);

export const deleteEventAsync = createAsyncThunk(
    'events/delete',
    async (eventId, { rejectWithValue }) => {
        try {
            await deleteEventAPI(eventId);
            return eventId;
        } catch (err) { return rejectWithValue(err.response?.data); }
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
            })
            .addCase(joinEventAsync.fulfilled, (state, action) => {
                const index = state.allEvents.findIndex(e => e._id === action.payload._id);
                if (index !== -1) {
                    state.allEvents[index] = action.payload;
                }
            })
            .addCase(deleteEventAsync.fulfilled, (state, action) => {
                state.allEvents = state.allEvents.filter(e => e._id !== action.payload);
            });
    }
});

export const { clearEvents } = eventSlice.actions;
export default eventSlice.reducer;