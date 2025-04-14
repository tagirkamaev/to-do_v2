import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Определяем тип состояния
interface UiState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  detailsOpen: boolean;
}

// Начальное состояние
const initialState: UiState = {
  theme: "light",
  sidebarOpen: true,
  detailsOpen: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: state => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    toggleSidebar: state => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleDetails: state => {
      state.detailsOpen = !state.detailsOpen;
    },
    setDetailsOpen: (state, action: PayloadAction<boolean>) => {
      state.detailsOpen = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, toggleDetails, setDetailsOpen } =
  uiSlice.actions;

export default uiSlice.reducer;
