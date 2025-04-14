import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "../features/ui/uiSlice";

// Store config
export const store = configureStore({
  reducer: {
    ui: uiReducer,
  },
});

// TS types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
