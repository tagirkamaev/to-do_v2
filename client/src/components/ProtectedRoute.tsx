import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectPath = "/login" }) => {
  const { user, loading } = useAppSelector(state => state.auth);

  // Если загрузка данных пользователя еще идет, показываем загрузчик
  if (loading) {
    return <div>Loading...</div>;
  }

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // Если пользователь аутентифицирован, отображаем защищенный контент
  return <Outlet />;
};

export default ProtectedRoute;
