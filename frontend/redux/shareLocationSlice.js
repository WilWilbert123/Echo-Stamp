import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../services/api';

export const getActiveShares = createAsyncThunk(
    'shareLocation/getActive',
    async (_, thunkAPI) => {
        try {
            const response = await api.fetchActiveShares();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || "Error fetching shares");
        }
    }
);

export const startSharing = createAsyncThunk(
    'shareLocation/start',
    async (data, thunkAPI) => {
        try {
            const response = await api.startLiveShare(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || "Error starting share");
        }
    }
);

export const stopSharing = createAsyncThunk(
    'shareLocation/stop',
    async (_, thunkAPI) => {
        try {
            await api.stopLiveShare();
            return true;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || "Error stopping share");
        }
    }
);

const shareLocationSlice = createSlice({
    name: 'shareLocation',
    initialState: {
        activeShares: [],
        isLiveSharing: false,
        loading: false,
    },
    reducers: {
        setSharingStatus: (state, action) => {
            state.isLiveSharing = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getActiveShares.fulfilled, (state, action) => {
                state.activeShares = action.payload;
            })
            .addCase(startSharing.fulfilled, (state) => {
                state.isLiveSharing = true;
            })
            .addCase(stopSharing.fulfilled, (state) => {
                state.isLiveSharing = false;
            });
    }
});

export const { setSharingStatus } = shareLocationSlice.actions;
export default shareLocationSlice.reducer;