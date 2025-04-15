import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/reduxHooks";
import { register } from "../features/auth/authSlice";

const RegisterForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(register(formData));
  };

  return (
    <div>
      <h2>Регистрация</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Имя</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
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
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
