import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../services/api';

/* --- FETCH ALL ECHOES (MODE) --- */
export const getEchoesAsync = createAsyncThunk(
  'echoes/get',
  async (userId, { getState, rejectWithValue }) => {
    try {
      // 1. Get token from the current Redux state
      const token = getState().auth.token; 
      
      // 2. Fetch using 'mood' as the type
      const response = await api.fetchEchoes(userId, 'mood', token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching echoes");
    }
  }
);

/* --- ADD NEW ECHO --- */
export const addEchoAsync = createAsyncThunk(
  'echoes/add',
  async (echoData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

     
      const payload = {
        userId: echoData.userId,
        type: 'mood', 
        title: echoData.title,
        description: echoData.description,
        emotion: echoData.emotion,
        location: {
          address: echoData.location?.address || ""
        }
      };

      const response = await api.postEcho(payload, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error saving echo");
    }
  }
);

/* --- DELETE ECHO --- */
export const deleteEchoAsync = createAsyncThunk(
  'echoes/delete',
  async ({ id }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await api.deleteEcho(id, token);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting echo");
    }
  }
);

const echoSlice = createSlice({
  name: 'echoes',
  initialState: { 
    list: [], 
    status: 'idle', 
    error: null 
  },
  reducers: {
    // You can add clearEchoes if the user logs out
    clearEchoes: (state) => {
      state.list = [];
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      /* Get Echoes Cases */
      .addCase(getEchoesAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getEchoesAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(getEchoesAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      /* Add Echo Case */
      .addCase(addEchoAsync.fulfilled, (state, action) => {
        state.list.unshift(action.payload); // Add to top of list
      })

      /* Delete Echo Case */
      .addCase(deleteEchoAsync.fulfilled, (state, action) => {
        state.list = state.list.filter(e => e._id !== action.payload);
      });
  },
});

export const { clearEchoes } = echoSlice.actions;
export default echoSlice.reducer;