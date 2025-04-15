import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/reduxHooks";
import { getProfile, logout } from "../features/auth/authSlice";
import { authService } from "../services/authService";

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector(state => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
  });
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setUpdateError(null);
    setUpdateSuccess(false);

    // Сбросить изменения, если режим редактирования отключен
    if (isEditing && user) {
      setEditData({
        name: user.name,
        email: user.email,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      await authService.updateProfile({
        name: editData.name,
        email: editData.email,
      });

      setUpdateSuccess(true);
      setIsEditing(false);
      dispatch(getProfile()); // Обновить данные профиля
    } catch (error) {
      if (error instanceof Error) {
        setUpdateError(error.message);
      } else {
        setUpdateError("Ошибка при обновлении профиля");
      }
    }
  };

  if (loading) {
    return <div>Загрузка профиля...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (!user) {
    return <div>Пользователь не найден</div>;
  }

  return (
    <div>
      <h1>Профиль пользователя</h1>
      {updateSuccess && <div className="success">Профиль успешно обновлен!</div>}
      {updateError && <div className="error">Ошибка: {updateError}</div>}

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Имя</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={editData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="actions">
            <button type="submit">Сохранить</button>
            <button type="button" onClick={handleEditToggle}>
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <p>
            <strong>Имя:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Дата регистрации:</strong> {new Date(user.createdAt).toLocaleString()}
          </p>

          <div className="actions">
            <button onClick={handleEditToggle}>Редактировать</button>
            <button onClick={handleLogout}>Выйти</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
