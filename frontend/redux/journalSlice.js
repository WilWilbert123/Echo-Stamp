import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteJournal,
  fetchGlobalFeed,
  fetchJournals,
  postJournal,
  removeMediaFromJournal
} from '../services/api';

// --- Async Thunks ---

// Fetch user's personal journals
export const getJournalsAsync = createAsyncThunk(
  'journals/fetchAll',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetchJournals(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching journals");
    }
  }
);

 
export const getGlobalJournalsAsync = createAsyncThunk(
  'journals/fetchGlobal',
  async (_, { getState, rejectWithValue }) => {
    try {
     
      const userId = getState().auth.user?.id; 
     
      const response = await fetchGlobalFeed(userId); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching global feed");
    }
  }
);

export const addJournalAsync = createAsyncThunk(
  'journals/add',
  async (journalData, { rejectWithValue }) => {
    try {
      const response = await postJournal(journalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error adding journal");
    }
  }
);

export const deleteJournalAsync = createAsyncThunk(
  'journals/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteJournal(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting journal");
    }
  }
);

export const removeJournalMediaAsync = createAsyncThunk(
  'journals/removeMedia',
  async ({ id, mediaUri }, { rejectWithValue }) => {
    try {
      const response = await removeMediaFromJournal(id, mediaUri);
      return response.data;  
    } catch (error) {
      return rejectWithValue(error.response?.data || "Server Error");
    }
  }
);

// --- Slice Definition ---

const journalSlice = createSlice({
  name: 'journals',
  initialState: {
    list: [],           
    globalList: [],      
    loading: false,
    globalLoading: false,  
    error: null,
  },
  reducers: {
    
    clearJournals: (state) => {
        state.list = [];
        state.globalList = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Personal Fetch ---
      .addCase(getJournalsAsync.pending, (state) => { state.loading = true; })
      .addCase(getJournalsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getJournalsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Global Feed Fetch ---
      .addCase(getGlobalJournalsAsync.pending, (state) => { state.globalLoading = true; })
      .addCase(getGlobalJournalsAsync.fulfilled, (state, action) => {
        state.globalLoading = false;
        state.globalList = action.payload;
      })
      .addCase(getGlobalJournalsAsync.rejected, (state, action) => {
        state.globalLoading = false;
        state.error = action.payload;
      })

      // --- Add ---
      .addCase(addJournalAsync.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      // --- Delete ---
      .addCase(deleteJournalAsync.fulfilled, (state, action) => {
        state.list = state.list.filter((j) => j._id !== action.payload);
        // Also remove from global list if it exists there
        state.globalList = state.globalList.filter((j) => j._id !== action.payload);
      })

      // --- Media Update ---
      .addCase(removeJournalMediaAsync.fulfilled, (state, action) => {
        const index = state.list.findIndex((j) => j._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        
       
        const globalIndex = state.globalList.findIndex((j) => j._id === action.payload._id);
        if (globalIndex !== -1) {
            state.globalList[globalIndex] = action.payload;
        }
      });
  },
});

export const { clearJournals } = journalSlice.actions;
export default journalSlice.reducer;