import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "../features/ui/uiSlice";
import authReducer from "../features/auth/authSlice";

// Store config
export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
  },
});

// TS types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
