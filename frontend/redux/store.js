import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import echoReducer from './echoSlice';
import eventReducer from './eventSlice';
import groupReducer from './groupSlice';
import journalReducer from './journalSlice';
import messageReducer from './messageSlice';
import notificationReducer from './notificationSlice';
import shareLocationReducer from './shareLocationSlice';

export const store = configureStore({
  reducer: {
    echoes: echoReducer,
    auth: authReducer,  
    journals: journalReducer,
    chat: chatReducer,
    events: eventReducer,
    messages: messageReducer,
    groups: groupReducer,
    notifications: notificationReducer,
    shareLocation: shareLocationReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,  
    }).concat(logger),  
});