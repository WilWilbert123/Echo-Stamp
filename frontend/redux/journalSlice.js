import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// ADD removeMediaFromJournal to your imports here
import { deleteJournal, fetchJournals, postJournal, removeMediaFromJournal } from '../services/api';

// Async Thunks
export const getJournalsAsync = createAsyncThunk(
  'journals/fetchAll',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetchJournals(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
      return rejectWithValue(error.response.data);
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
      return rejectWithValue(error.response.data);
    }
  }
);

// This function now has access to the imported 'removeMediaFromJournal'
export const removeJournalMediaAsync = createAsyncThunk(
  'journals/removeMedia',
  async ({ id, mediaUri }, { rejectWithValue }) => {
    try {
      const response = await removeMediaFromJournal(id, mediaUri);
      return response.data; // This is the updated journal object from backend
    } catch (error) {
      return rejectWithValue(error.response?.data || "Server Error");
    }
  }
);

const journalSlice = createSlice({
  name: 'journals',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(getJournalsAsync.pending, (state) => { state.loading = true; })
      .addCase(getJournalsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(getJournalsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addJournalAsync.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      // Delete Entire Journal
      .addCase(deleteJournalAsync.fulfilled, (state, action) => {
        state.list = state.list.filter((j) => j._id !== action.payload);
      })
      // --- ADD THIS: Update Single Media Deletion in State ---
      .addCase(removeJournalMediaAsync.fulfilled, (state, action) => {
        const index = state.list.findIndex((j) => j._id === action.payload._id);
        if (index !== -1) {
          // Replace the old journal with the new one returned by the server
          state.list[index] = action.payload;
        }
      });
  },
});

export default journalSlice.reducer;