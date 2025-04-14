import React from "react";
import { useAppSelector, useAppDispatch } from "../hooks/reduxHooks";
import { toggleTheme } from "../features/ui/uiSlice";

const ThemeToggleButton: React.FC = () => {
  const theme = useAppSelector(state => state.ui.theme);

  const dispatch = useAppDispatch();

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <button onClick={handleToggleTheme}>
      Switch to {theme === "light" ? "Dark" : "Light"} Theme
    </button>
  );
};

export default ThemeToggleButton;
