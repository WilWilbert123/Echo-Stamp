import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import authReducer from './authSlice'; // Import the new slice
import echoReducer from './echoSlice';
import journalReducer from './journalSlice';

export const store = configureStore({
  reducer: {
    echoes: echoReducer,
    auth: authReducer,  
    journals: journalReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,  
    }).concat(logger),  
});