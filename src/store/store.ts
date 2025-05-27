import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import resetPasswordReducer from './features/resetPasswordSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    resetPassword: resetPasswordReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 