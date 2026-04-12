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

/* --- FETCH GLOBAL FEED (ALL USERS) --- */
export const getGlobalEchoesAsync = createAsyncThunk(
  'echoes/getGlobal',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.fetchGlobalEchoes();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching global feed");
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

/* --- LIKE ECHO --- */
export const likeEchoAsync = createAsyncThunk(
  'echoes/like',
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const response = await api.likeEcho(id, userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error liking echo");
    }
  }
);

/* --- COMMENT ON ECHO --- */
export const commentEchoAsync = createAsyncThunk(
  'echoes/comment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.commentEcho(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error commenting on echo");
    }
  }
);

/* --- REPLY TO COMMENT --- */
export const replyToEchoCommentAsync = createAsyncThunk(
  'echoes/reply',
  async ({ id, commentId, data }, { rejectWithValue }) => {
    try {
      const response = await api.replyToEchoComment(id, commentId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error replying to comment");
    }
  }
);

/* --- DELETE COMMENT --- */
export const deleteEchoCommentAsync = createAsyncThunk(
  'echoes/deleteComment',
  async ({ id, commentId }, { rejectWithValue }) => {
    try {
      const response = await api.removeEchoComment(id, commentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting comment");
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
      /* Global Echoes Cases */
      .addCase(getGlobalEchoesAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getGlobalEchoesAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(getGlobalEchoesAsync.rejected, (state, action) => {
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
      })
      /* Social Interaction Success Cases (Updating the specific echo in the list) */
      .addCase(likeEchoAsync.fulfilled, (state, action) => {
        const index = state.list.findIndex(e => e._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(commentEchoAsync.fulfilled, (state, action) => {
        const index = state.list.findIndex(e => e._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(replyToEchoCommentAsync.fulfilled, (state, action) => {
        const index = state.list.findIndex(e => e._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteEchoCommentAsync.fulfilled, (state, action) => {
        const index = state.list.findIndex(e => e._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      });
  },
});

export const { clearEchoes } = echoSlice.actions;
export default echoSlice.reducer;