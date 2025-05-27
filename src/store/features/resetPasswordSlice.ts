import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ResetPasswordState {
  email: string;
  step: 'initial' | 'verification' | 'new-password';
}

const initialState: ResetPasswordState = {
  email: '',
  step: 'initial'
};

export const resetPasswordSlice = createSlice({
  name: 'resetPassword',
  initialState,
  reducers: {
    initiateReset: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
      state.step = 'verification';
    },
    proceedToNewPassword: (state) => {
      state.step = 'new-password';
    },
    resetFlow: (state) => {
      state.email = '';
      state.step = 'initial';
    }
  },
});

export const { initiateReset, proceedToNewPassword, resetFlow } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer; 