import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../services/api';

export const getEchoesAsync = createAsyncThunk('echoes/get', async () => {
  const response = await api.fetchEchoes();
  return response.data;
});

export const addEchoAsync = createAsyncThunk('echoes/add', async (echoData) => {
  const response = await api.postEcho(echoData);
  return response.data; // This is the 'newEcho' from your controller
});

const echoSlice = createSlice({
  name: 'echoes',
  initialState: { list: [], status: 'idle' },
  extraReducers: (builder) => {
    builder
      .addCase(getEchoesAsync.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(addEchoAsync.fulfilled, (state, action) => {
        state.list.unshift(action.payload); // Put newest memory at the top
      });
  },
});

export default echoSlice.reducer;