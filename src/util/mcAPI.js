import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: process.env.API,
  headers: {
    token: `${getToken()}`
  }
});

// Создание экземпляра MinIO Client
const Minio = require('minio');
const s3Client = new Minio.Client({
  endPoint: '192.168.0.61',
  useSSL: false,
  port: 9000,
  accessKey: 'your_access_key',
  secretKey: 'your_secret_key',
});
