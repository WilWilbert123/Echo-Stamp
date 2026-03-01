import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import echoReducer from './echoSlice';

export const store = configureStore({
  reducer: {
    echoes: echoReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,  
    }).concat(logger),  
});