import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import echoReducer from './echoSlice';
import eventReducer from './eventSlice';
import journalReducer from './journalSlice';
import messageReducer from './messageSlice';

export const store = configureStore({
  reducer: {
    echoes: echoReducer,
    auth: authReducer,  
    journals: journalReducer,
    chat: chatReducer,
    events: eventReducer,
    messages: messageReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,  
    }).concat(logger),  
});