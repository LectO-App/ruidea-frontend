import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

axiosInstance.interceptors.request.use(
  function (config) {
    config.headers = {
      ...config.headers,
      authkey: process.env.REACT_APP_SERVER_KEY,
    };

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
