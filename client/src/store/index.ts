import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "../features/ui/uiSlice";
import authReducer from "../features/auth/authSlice";
import projectsReducer from "../features/projects/projectsSlice";
import tasksReducer from "../features/tasks/tasksSlice";

// Store config
export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
  },
});

// TS types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
