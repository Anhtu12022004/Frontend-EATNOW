import { apiClient } from './api';
import { Branch, MenuItem, Rating, Table, Customer, User } from '../types';

// Re-export all services
export { branchService } from './branch';
export { menuService } from './menu';
export { orderService } from './order';
export { reservationService } from './reservation';
export { paymentService } from './payment';
export { feedbackService } from './feedback';
export { userService } from './user';
export { staffService, STAFF_POSITIONS } from './staff';
export type { BranchStaff, CreateStaffRequest, UpdateStaffRequest } from './staff';

// ============ Auth Service ============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  role: 'customer' | 'staff' | 'admin' | 'superadmin';
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    if (response.data.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    if (response.data.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    apiClient.setToken(null);
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    return apiClient.post<{ message: string }>('/auth/forgot-password', data);
  },

  verifyOtp: async (email: string, otp: string) => {
    return apiClient.post<{ valid: boolean }>('/auth/verify-otp', { email, otp });
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    return apiClient.post<{ message: string }>('/auth/reset-password', data);
  },

  getProfile: async () => {
    return apiClient.get<Customer>('/auth/profile');
  },

  updateProfile: async (data: Partial<Customer>) => {
    return apiClient.put<Customer>('/auth/profile', data);
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiClient.post<{ message: string }>('/auth/change-password', { oldPassword, newPassword });
  },
};

// ============ Rating Service ============
export interface CreateRatingRequest {
  orderId: string;
  type: 'dish' | 'branch';
  dishId?: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment: string;
  images?: string[];
}

export const ratingService = {
  getAll: async (params?: { branchId?: string; status?: string; type?: string }) => {
    return apiClient.get<Rating[]>('/ratings', params as Record<string, string>);
  },

  getByOrder: async (orderId: string) => {
    return apiClient.get<Rating[]>(`/ratings/order/${orderId}`);
  },

  create: async (data: CreateRatingRequest) => {
    return apiClient.post<Rating>('/ratings', data);
  },

  approve: async (id: string) => {
    return apiClient.patch<Rating>(`/ratings/${id}/approve`);
  },

  hide: async (id: string) => {
    return apiClient.patch<Rating>(`/ratings/${id}/hide`);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/ratings/${id}`);
  },
};

// ============ Table Service (Legacy - use reservationService.getTablesByBranch) ============
export const tableService = {
  getAll: async (params?: { branchId?: string; status?: string; area?: string }) => {
    return apiClient.get<Table[]>('/tables', params as Record<string, string>);
  },

  getById: async (id: string) => {
    return apiClient.get<Table>(`/tables/${id}`);
  },

  getAvailable: async (branchId: string, date: string, time: string, seats: number) => {
    return apiClient.get<Table[]>('/tables/available', {
      branchId,
      date,
      time,
      seats: seats.toString(),
    });
  },

  updateStatus: async (id: string, status: Table['status']) => {
    return apiClient.patch<Table>(`/tables/${id}/status`, { status });
  },
};

// ============ Customer Service (Legacy - use userService) ============
export const customerService = {
  getAll: async (params?: { search?: string }) => {
    return apiClient.get<Customer[]>('/customers', params as Record<string, string>);
  },

  getById: async (id: string) => {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  update: async (id: string, data: Partial<Customer>) => {
    return apiClient.put<Customer>(`/customers/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/customers/${id}`);
  },
};

// ============ Analytics Service ============
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageRating: number;
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  pendingReservations: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export const analyticsService = {
  getDashboardStats: async (branchId?: string) => {
    return apiClient.get<DashboardStats>('/analytics/dashboard', branchId ? { branchId } : undefined);
  },

  getRevenueChart: async (params: { startDate: string; endDate: string; branchId?: string }) => {
    return apiClient.get<RevenueData[]>('/analytics/revenue', params as Record<string, string>);
  },

  getTopSellingItems: async (params: { startDate: string; endDate: string; branchId?: string; limit?: number }) => {
    const queryParams: Record<string, string> = {
      startDate: params.startDate,
      endDate: params.endDate
    };
    if (params.branchId) queryParams.branchId = params.branchId;
    if (params.limit) queryParams.limit = String(params.limit);
    return apiClient.get<Array<MenuItem & { totalSold: number }>>('/analytics/top-items', queryParams);
  },

  getBranchPerformance: async () => {
    return apiClient.get<Array<Branch & { revenue: number; orders: number; rating: number }>>('/analytics/branch-performance');
  },
};
