// permissions.js
import Cookies from "js-cookie";

// import axiosClient from "../util/axiosClient";

const getSessionFromLocalStorage = () => {
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");

  if (username && password) {
    return {  token: Cookies.get('token'), username, password };
  }

  return null;
};

export const getUserPermissions = async () => {
  try {
    // const response = await axiosClient.get('/session');

    // if (response.data && response.data) {
      return [];
    // } else {
    //   throw new Error('Error getting user permissions');
    // }
  } catch (error) {
    console.error('Error getting user permissions:', error);
    throw error;
  }
};

const hasPermission = async (scopes) => {
  const { token } = getSessionFromLocalStorage();

  const userPermissions = await getUserPermissions(token);

  const hasAllPermissions = scopes.every((scope) =>
    userPermissions?.includes(scope)
  );

  return hasAllPermissions;
};

export default hasPermission;
