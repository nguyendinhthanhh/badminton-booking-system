import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag để tránh multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Interceptor cho Request: Đính kèm AccessToken vào header
axiosClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor cho Response: Xử lý lỗi 401/403 và refresh token
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Log để debug
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log(`🔴 Received ${error.response.status} error for:`, originalRequest.url);
        }

        // Nếu lỗi 401 hoặc 403 và chưa retry
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            if (isRefreshing) {
                // Nếu đang refresh, đưa request vào queue
                console.log('⏳ Request queued while refreshing token');
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = useAuthStore.getState().refreshToken;

            if (!refreshToken) {
                // Không có refresh token -> logout
                console.log('❌ No refresh token available, logging out');
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Gọi API refresh token
                console.log('🔄 Attempting to refresh token...');
                const response = await axios.post('http://localhost:8080/api/auth/refresh', {
                    refreshToken: refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;
                console.log('✅ Token refreshed successfully');

                // Cập nhật tokens mới
                useAuthStore.getState().setAccessToken(accessToken);
                if (newRefreshToken) {
                    useAuthStore.getState().setRefreshToken(newRefreshToken);
                }

                // Cập nhật header cho request ban đầu
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // Process queue với token mới
                processQueue(null, accessToken);

                isRefreshing = false;

                // Retry request ban đầu
                console.log('🔁 Retrying original request');
                return axiosClient(originalRequest);
            } catch (refreshError) {
                // Refresh token thất bại -> logout
                console.error('❌ Token refresh failed:', refreshError.response?.data || refreshError.message);
                processQueue(refreshError, null);
                isRefreshing = false;
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
