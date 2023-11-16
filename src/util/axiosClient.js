import axios from 'axios';

import baseURL from '../config/baseUrl';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
    baseURL,
    withCredentials: true,
})

axiosClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token'); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.log(error)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        window.location.replace("/login");
      }
      return Promise.reject(error?.response?.data || error?.message);
    }
  );

export default axiosClient;