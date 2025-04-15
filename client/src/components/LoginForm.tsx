import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/reduxHooks";
import { login, logout, getProfile } from "../features/auth/authSlice";

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(login(formData));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  useEffect(() => {
    if (user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  return (
    <div>
      <h2>Вход в систему</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      {user ? (
        <div>
          <p>Hello, {user.name}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            Войти
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
