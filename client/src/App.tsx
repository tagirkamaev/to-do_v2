import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./hooks/reduxHooks";
import { getProfile } from "./features/auth/authSlice";

// Компоненты
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ProfilePage from "./components/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import ThemeToggleButton from "./components/ThemeToggleButton";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { theme } = useAppSelector(state => state.ui);

  useEffect(() => {
    // При запуске приложения проверяем, есть ли токен и загружаем профиль
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getProfile());
    }
  }, [dispatch]);

  return (
    <div className={`app ${theme}`}>
      <BrowserRouter>
        <header>
          <h1>Todo App</h1>
          <ThemeToggleButton />
        </header>

        <Routes>
          <Route path="/login" element={user ? <Navigate to="/profile" /> : <LoginForm />} />
          <Route path="/register" element={user ? <Navigate to="/profile" /> : <RegisterForm />} />

          {/* Защищенные маршруты */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            {/* Здесь будут добавлены маршруты для задач и проектов */}
          </Route>

          {/* Перенаправление с / на login или dashboard в зависимости от авторизации */}
          <Route path="/" element={user ? <Navigate to="/profile" /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
