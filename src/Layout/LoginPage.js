import React, { useState } from "react";
import { Message } from "primereact/message";
import { useHistory } from "react-router-dom";
import axiosClient from "../util/axiosClient";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const LoginPage = () => {
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosClient.post("/auth/login", {
        username: accessKey,
        password: secretKey,
      });

      const token = response.data.token;

      if (token) {
        localStorage.setItem('accessToken', token)
        localStorage.setItem("username", accessKey);
        localStorage.setItem("password", secretKey);
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem("userRole", response.data?.user?.role);
        window.location.replace("/home");
        setError("");
      }
    } catch (err) {
      if (err?.error?.includes("401")) {
        setError("Access denied. Username or password is wrong");
      } else {
        setError(`Error: ${err?.message || err?.err?.message || err}`);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <div className="logo">
          <img src="assets/logo.png" alt="Hue Logo" className="logo-image" />
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-field">
            <InputText
              type="text"
              id="accessKey"
              placeholder="Username"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
            />
          </div>
          <div className="form-field">
            <InputText
              type="password"
              id="secretKey"
              placeholder="Password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          </div>
          <div className="form-field">
            {error && <Message severity="error" text={error} />}
          </div>
          <div className="form-field">
            <Button type="submit" label="Login" onClick={handleLogin}/>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
