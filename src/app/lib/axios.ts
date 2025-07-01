import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// ✅ Automatically attach token to every request
instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    console.log("🧩 Attaching token:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No token found in localStorage");
    }
  }
  return config;
}, (error) => {
  console.error("❌ Axios request error:", error);
  return Promise.reject(error);
});

export default instance;
