import { configureStore } from "@reduxjs/toolkit";

// Store config
export const store = configureStore({
  reducer: {},
});

// TS types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
