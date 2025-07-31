"use client"
import React, { useState } from "react";
import "../register/styles/register.css";
import axios from "axios";

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await axios
      .post("http://localhost:6969/api/users/add-player", {
        Username: formData.username,
        Email: formData.email,
        Password: formData.password,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err.data);
      });
  };

  return (
    <div className="register-outer-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default RegisterPage;
