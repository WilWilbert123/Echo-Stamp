import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
    },
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            state.loading = false;
        },
    updatePrivacy: (state, action) => {
        if (state.user) {
            state.user.isPublic = action.payload;  
        }
    },
        updateUser: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { setCredentials, logout, updatePrivacy, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;