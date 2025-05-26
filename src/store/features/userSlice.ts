import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  email: string;
  password: string;
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  id: string | null;
}

const initialState: UserState = {
  email: '',
  password: '',
  isVerified: false,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  id: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<{ email: string; password?: string; id?: string }>) => {
      state.email = action.payload.email;
      if (action.payload.password) {
        state.password = action.payload.password;
      }
      if (action.payload.id) {
        state.id = action.payload.id;
      }
    },
    setVerificationStatus: (state, action: PayloadAction<boolean>) => {
      state.isVerified = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearUserData: (state) => {
      return initialState;
    },
  },
});

export const {
  setUserData,
  setVerificationStatus,
  setAuthenticated,
  setLoading,
  setError,
  clearUserData,
} = userSlice.actions;

export default userSlice.reducer; 