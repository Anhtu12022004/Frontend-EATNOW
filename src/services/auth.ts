import { apiClient, ApiError } from './api';
import { Customer, UserRole } from '../types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginApiResponse {
  token: string;
  data: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string | null;
    status: string;
    createdAt: string;
    role: string; // 'Customer', 'Staff', 'Admin', 'SuperAdmin'
  };
  message: string;
  success: boolean;
}

interface AuthResponse {
  user: Customer;
  role: UserRole;
  token: string;
}

interface RegisterApiResponse {
  data: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string | null;
    status: string;
    createdAt: string;
    role: string;
  };
  message: string;
  success: boolean;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  email: string; // Trả về email để tự động điền vào form login
}

class AuthService {
  /**
   * Map role string từ backend sang UserRole
   */
  private mapRole(backendRole: string): UserRole {
    const roleMap: Record<string, UserRole> = {
      'customer': 'customer',
      'Customer': 'customer',
      'staff': 'staff',
      'Staff': 'staff',
      'admin': 'admin',
      'Admin': 'admin',
      'superadmin': 'superadmin',
      'SuperAdmin': 'superadmin'
    };
    return roleMap[backendRole] || 'customer';
  }

  /**
   * Chuyển đổi user từ API response sang Customer object
   */
  private mapUserResponse(apiUser: LoginApiResponse['data']): Customer {
    return {
      id: apiUser.id,
      name: apiUser.fullName,
      email: apiUser.email,
      phone: apiUser.phone,
      address: apiUser.address || undefined,
      joinedDate: new Date(apiUser.createdAt),
      status: apiUser.status
    };
  }
  /**
   * Đăng nhập người dùng
   * @param credentials Email và password
   * @returns User data, role, và JWT token
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<LoginApiResponse['data']>('/auth/login', credentials);
      console.log('Login response:', response);

      // Kiểm tra xem backend trả về success hay không
      if (!response.success) {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }

      const token = (response as any).token;
      const apiUser = response.data;

      if (!token) {
        throw new Error('Token không được trả về từ server');
      }

      if (!apiUser) {
        throw new Error('Dữ liệu người dùng không được trả về từ server');
      }

      // Map role từ backend response
      const role = this.mapRole(apiUser.role);

      // Chuyển đổi user từ API response
      const user = this.mapUserResponse(apiUser);

      // Tạo AuthResponse object
      const authResponse: AuthResponse = {
        user,
        role,
        token
      };

      console.log('Auth response:', authResponse);

      // Lưu token vào localStorage và set Authorization header
      apiClient.setToken(token);

      return authResponse;
    } catch (error) {
      const apiError = error as any;
      
      // Lấy thông báo lỗi chi tiết từ field errors nếu có
      let errorMessage = apiError.message || 'Đăng nhập thất bại';
      
      if (apiError.errors) {
        const fieldErrors = Object.values(apiError.errors).flat();
        if (fieldErrors.length > 0) {
          errorMessage = (fieldErrors[0] as string);
        }
      }
      
      // Xử lý trường hợp backend trả về lỗi chung chung
      // if (errorMessage.toLowerCase().includes('network')) {
      //   errorMessage = 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
      // }
      
      console.error('Login error:', {
        message: errorMessage,
        originalError: apiError.message,
        statusCode: apiError.statusCode,
        timestamp: new Date().toISOString()
      });
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Đăng ký tài khoản mới
   * @param data Thông tin đăng ký
   * @returns Success status và email để redirect sang login
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterApiResponse['data']>('/auth/register', data);
      console.log('Register response:', response);
      
      // Kiểm tra xem backend trả về success hay không
      if (!response.success) {
        throw new Error(response.message || 'Đăng ký thất bại');
      }

      // Khi thành công, response.data là user object
      const userData = response.data;
      
      return {
        success: true,
        message: response.message || 'Đăng ký thành công',
        email: userData?.email || data.email
      };
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Đăng ký thất bại');
    }
  }

  /**
   * Kiểm tra xem token còn hợp lệ không
   * @returns true nếu token hợp lệ, false nếu hết hạn
   */
  async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get<{ valid: boolean }>('/auth/verify');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns Thông tin user
   */
  async getCurrentUser(): Promise<Customer> {
    try {
      const response = await apiClient.get<Customer>('/auth/me');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Không thể lấy thông tin người dùng');
    }
  }

  /**
   * Đăng xuất
   */
  logout(): void {
    apiClient.setToken(null);
    // Xóa tất cả token-related keys từ localStorage
    localStorage.removeItem('eatnow_auth');
    localStorage.removeItem('auth_token');

    window.location.reload();
  }

  /**
   * Lấy token từ localStorage
   */
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Kiểm tra người dùng đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const authService = new AuthService();
