import React from "react";
import axiosClient from "../util/axiosClient";
import Cookies from "js-cookie";

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      // await axiosClient.post("/logout", { state: null});
      window.location.href = "/login";
      Cookies.remove('token');
      localStorage.removeItem('accessToken');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
