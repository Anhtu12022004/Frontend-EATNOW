import React, { createContext, useContext, useState, useCallback } from "react";
import { Customer, UserRole } from "../types";
import { apiClient } from "../services/api";
import { toast } from "sonner";

interface AuthState {
  user: Customer | null;
  role: UserRole;
  isLoggedIn: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Customer) => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "eatnow_auth";

interface StoredAuth {
  user: Customer | null;
  role: UserRole;
  token: string | null;
}

function loadAuthFromStorage(): StoredAuth {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { user: null, role: "guest", token: null };
}

function saveAuthToStorage(auth: StoredAuth): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

function clearAuthFromStorage(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const stored = loadAuthFromStorage();
    return {
      user: stored.user,
      role: stored.user ? "customer" : "guest",
      isLoggedIn: !!stored.user,
      isLoading: false,
    };
  });

  // Login with real API
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        // Call real API
        const response = await apiClient.post<{
          id: string;
          fullName: string;
          email: string;
          phone: string;
          address: string;
          status: string;
          createdAt: string;
          role: string;
          branchId?: string;
        }>("/auth/login", { email, password });

        // Extract token and user data from response
        const token = response.token;
        const userData = response.data;

        if (token) {
          apiClient.setToken(token);
        }

        // Map role from API to frontend role
        let role: UserRole = "customer";
        const apiRole = userData.role?.toLowerCase();
        if (apiRole === "staff") {
          role = "staff";
        } else if (apiRole === "admin") {
          role = "admin";
        } else if (apiRole === "superadmin") {
          role = "superadmin";
        }

        const user: Customer = {
          id: userData.id,
          name: userData.fullName,
          email: userData.email,
          phone: userData.phone || "",
          address: userData.address || "",
          joinedDate: new Date(userData.createdAt),
          status: userData.status,
          branchId: userData.branchId || null,
        };

        const newState = {
          user,
          role,
          isLoggedIn: true,
          isLoading: false,
        };

        setState(newState);
        saveAuthToStorage({ user, role, token: token || "token" });

        toast.success("Đăng nhập thành công!", {
          description: `Chào mừng ${user.name}`,
        });

        return true;
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }));
        toast.error("Đăng nhập thất bại", {
          description: "Email hoặc mật khẩu không đúng",
        });
        return false;
      }
    },
    []
  );

  // Register with API
  const register = useCallback(
    async (
      name: string,
      email: string,
      phone: string,
      _password: string
    ): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        // TODO: Call real register API when available
        // const response = await apiClient.post('/auth/register', { name, email, phone, password: _password });
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newUser: Customer = {
          id: "c" + Date.now(),
          name,
          email,
          phone,
          joinedDate: new Date(),
        };

        const newState = {
          user: newUser,
          role: "customer" as UserRole,
          isLoggedIn: true,
          isLoading: false,
        };

        setState(newState);
        saveAuthToStorage({
          user: newUser,
          role: "customer",
          token: "mock_token",
        });

        toast.success("Đăng ký thành công!", {
          description: `Chào mừng ${newUser.name} đến với EATNOW`,
        });

        return true;
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }));
        toast.error("Đăng ký thất bại", {
          description: "Vui lòng thử lại sau",
        });
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    setState({
      user: null,
      role: "guest",
      isLoggedIn: false,
      isLoading: false,
    });
    clearAuthFromStorage();
    toast.info("Đã đăng xuất");
  }, []);

  const updateProfile = useCallback((data: Customer) => {
    setState((prev) => ({
      ...prev,
      user: data,
    }));
    const stored = loadAuthFromStorage();
    saveAuthToStorage({ ...stored, user: data });
    toast.success("Cập nhật thông tin thành công");
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setState((prev) => ({ ...prev, role }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    setRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
