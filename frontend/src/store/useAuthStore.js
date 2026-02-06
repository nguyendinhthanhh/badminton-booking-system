import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosClient from "../axiosConfig/axiosConfig.js";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => set({ user }),

      handleLogin: async (username, password) => {
        set({ isLoading: true });
        try {
          console.log("Login request:", { username, password });

          const res = await axiosClient.post("/auth/login", {
            username,
            password,
          });

          console.log("Login response:", res);
          console.log("Response data:", res.data);

          // Set access token first so subsequent requests can use it
          set({
            accessToken: res.data.accessToken,
          });

          // Fetch full user profile with all fields (gender, dateOfBirth, avatar, etc.)
          try {
            const profileRes = await axiosClient.get("/users/me");
            console.log("Full profile data:", profileRes.data);

            set({
              user: profileRes.data, // Full user data with all fields
              isLoading: false,
            });

            return profileRes.data;
          } catch (profileErr) {
            console.error("Error fetching full profile:", profileErr);
            // Fallback to basic user info from login response
            set({
              user: res.data.user,
              isLoading: false,
            });
            return res.data.user;
          }
        } catch (err) {
          console.error("Login error:", err);
          set({ isLoading: false });
          throw err;
        }
      },

      handleRegister: async (registerData) => {
        set({ isLoading: true });
        try {
          const res = await axiosClient.post("/auth/register", registerData);
          set({ isLoading: false });
          return res.data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        // Chỉ cần xóa state local
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: "auth-storage", // Tên key trong localStorage
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
);

export default useAuthStore;
