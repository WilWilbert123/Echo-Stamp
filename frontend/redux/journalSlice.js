import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    commentJournal,
    deleteJournal,
    fetchGlobalFeed,
    fetchJournals,
    likeJournal,
    postJournal,
    removeComment,
    removeMediaFromJournal,
    replyToComment,
    updateComment,
    updateReply
} from '../services/api';

// --- Async Thunks ---

// Fetch user's personal journals
export const getJournalsAsync = createAsyncThunk(
  'journals/fetchAll',
  async (userId, { rejectWithValue }) => {
    try {
     
      if (!userId) return rejectWithValue("User ID is missing");
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
      
      const authUser = getState().auth.user;
      const userId = authUser?._id || authUser?.id || null; 
 
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

export const toggleLikeAsync = createAsyncThunk(
  'journals/like',
  async (id, { rejectWithValue }) => {
    try {
      const response = await likeJournal(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error liking journal");
    }
  }
);

export const addCommentAsync = createAsyncThunk(
  'journals/comment',
  async ({ id, text }, { rejectWithValue }) => {
    try {
      const response = await commentJournal(id, text);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error adding comment");
    }
  }
);

export const addReplyAsync = createAsyncThunk(
  'journals/reply',
  async ({ id, commentId, text }, { rejectWithValue }) => {
    try {
      const response = await replyToComment(id, commentId, text);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error adding reply");
    }
  }
);

export const editCommentAsync = createAsyncThunk(
  'journals/editComment',
  async ({ id, commentId, text }, { rejectWithValue }) => {
    try {
      const response = await updateComment(id, commentId, text);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error editing comment");
    }
  }
);

export const deleteCommentAsync = createAsyncThunk(
  'journals/deleteComment',
  async ({ id, commentId }, { rejectWithValue }) => {
    try {
      const response = await removeComment(id, commentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting comment");
    }
  }
);

export const editReplyAsync = createAsyncThunk(
  'journals/editReply',
  async ({ id, commentId, replyId, text }, { rejectWithValue }) => {
    try {
      const response = await updateReply(id, commentId, replyId, text);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error editing reply");
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
        state.error = null;
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
      .addCase(getGlobalJournalsAsync.pending, (state) => { 
        state.globalLoading = true; 
        state.error = null;  
      })
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
        state.globalList.unshift(action.payload);  
      })

      // --- Delete ---
      .addCase(deleteJournalAsync.fulfilled, (state, action) => {
        state.list = state.list.filter((j) => j._id !== action.payload);
        state.globalList = state.globalList.filter((j) => j._id !== action.payload);
      })

      // --- Media Update ---
      .addCase(removeJournalMediaAsync.fulfilled, (state, action) => {
        const index = state.list.findIndex((j) => j._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
        
        const globalIndex = state.globalList.findIndex((j) => j._id === action.payload._id);
        if (globalIndex !== -1) state.globalList[globalIndex] = action.payload;
      })
      // --- Interactions (Like/Comment/Reply) ---
      .addMatcher(
        (action) => [toggleLikeAsync.fulfilled.type, addCommentAsync.fulfilled.type, addReplyAsync.fulfilled.type, editCommentAsync.fulfilled.type, deleteCommentAsync.fulfilled.type, editReplyAsync.fulfilled.type].includes(action.type),
        (state, action) => {
            const index = state.list.findIndex((j) => j._id === action.payload._id);
            if (index !== -1) state.list[index] = action.payload;
            
            const globalIndex = state.globalList.findIndex((j) => j._id === action.payload._id);
            if (globalIndex !== -1) state.globalList[globalIndex] = action.payload;
        }
      );
  },
});

export const { clearJournals } = journalSlice.actions;
export default journalSlice.reducer;