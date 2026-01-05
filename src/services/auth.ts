import { apiClient, ApiResponse, ApiError } from './api';
import { Customer, UserRole } from '../types';

interface LoginRequest {
  email: string;
  password: string;
}

interface JWTPayload {
  userId?: string;
  email: string;
  phone: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthResponse {
  user: Customer;
  role: UserRole;
  token: string;
}

class AuthService {
  /**
   * Mã hóa JWT token (Base64Url encoding)
   * @param payload Dữ liệu cần mã hóa (user, role, ...)
   * @param secret Secret key để ký token (tuỳ chọn)
   * @returns JWT token
   */
  private encodeJWT(payload: JWTPayload, secret: string = 'your-secret-key'): string {
    // Header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    // Payload
    const now = Math.floor(Date.now() / 1000);
    const payloadWithTimestamp = {
      ...payload,
      iat: payload.iat || now,
      exp: payload.exp || (now + 24 * 60 * 60) // Token hết hạn sau 24 giờ
    };

    // Encode header và payload thành Base64Url
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payloadWithTimestamp));

    // Tạo signature
    const message = `${encodedHeader}.${encodedPayload}`;
    const signature = this.base64UrlEncode(
      this.hmacSHA256(message, secret)
    );

    // Trả về JWT token đầy đủ
    return `${message}.${signature}`;
  }

  /**
   * Base64Url encoding
   */
  private base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * HMAC SHA256 (đơn giản hóa - trong production dùng thư viện crypto)
   */
  private hmacSHA256(message: string, secret: string): string {
    // Trong thực tế, bạn nên dùng thư viện 'jose' hoặc 'crypto-js'
    // Đây là một phiên bản đơn giản hóa
    return btoa(message + secret).slice(0, 43);
  }

  /**
   * Decode JWT token
   * @param token JWT token
   * @returns Decoded payload
   */
  private decodeJWT(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const decoded = atob(
        parts[1].replace(/-/g, '+').replace(/_/g, '/')
      );
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Normalize token payload - Loại bỏ các đường dẫn Microsoft Claims
   * @param payload Raw payload từ token
   * @returns Normalized payload
   */
  private normalizeTokenPayload(payload: any): JWTPayload {
    const normalized: any = {};

    // Mapping các trường Microsoft Claims sang tên đơn giản
    const claimsMapping: Record<string, string> = {
      // Microsoft Claims
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'role',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': 'email',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': 'userId',
      
      // Standard claims
      'aud': 'aud',
      'iss': 'iss',
      'iat': 'iat',
      'exp': 'exp',
      'role': 'role',
      'email': 'email',
      'userId': 'userId',
      'sub': 'userId'
    };

    // Duyệt qua tất cả các trường trong payload
    for (const [key, value] of Object.entries(payload)) {
      // Nếu có mapping, dùng tên đơn giản
      if (claimsMapping[key]) {
        const simpleName = claimsMapping[key];
        // Nếu chưa có trường này, gán giá trị
        if (!normalized[simpleName]) {
          normalized[simpleName] = value;
        }
      }
      // Nếu không có mapping và không phải URI dài, giữ lại
      else if (!key.startsWith('http://') && !key.startsWith('https://')) {
        normalized[key] = value;
      }
    }

    // Đảm bảo các trường bắt buộc
    return {
      userId: normalized.userId || normalized.sub,
      name: normalized.name || 'User',
      email: normalized.email || '',
      phone: normalized.phone || '',
      role: normalized.role || 'customer',
      iat: normalized.iat,
      exp: normalized.exp
    };
  }

  /**
   * Tạo user object từ decoded token
   * @param decodedToken Token đã decode
   * @returns Customer object
   */
  private createUserFromToken(decodedToken: JWTPayload): Customer {
    return {
      id: decodedToken.userId || '',
      name: 'User',
      email: decodedToken.email || '',
      phone: decodedToken.phone || '',
      address: decodedToken.email || '',
      joinedDate: decodedToken.iat ? new Date(decodedToken.iat * 1000) : new Date()
    };
  }
  /**
   * Đăng nhập người dùng
   * @param credentials Email và password
   * @returns User data, role, và JWT token
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<{ token: string }>('/auth/login', credentials);
      console.log('Login response:', response);

      // Lấy token từ response
      const token = response.data.token;
      if (!token) {
        throw new Error('Token không được trả về từ server');
      }

      // Decode token
      const decodedToken = this.decodeJWT(token);
      if (!decodedToken) {
        throw new Error('Không thể decode token');
      }

      console.log('Decoded token (raw):', decodedToken);

      // Normalize payload - loại bỏ các đường dẫn Microsoft Claims
      const normalizedToken = this.normalizeTokenPayload(decodedToken);
      console.log('Decoded token (normalized):', normalizedToken);

      // Xác định role từ normalized token
      const role = (normalizedToken.role?.toLowerCase() === 'customer' ? 'customer' 
                  : normalizedToken.role?.toLowerCase() === 'staff' ? 'staff'
                  : normalizedToken.role?.toLowerCase() === 'admin' ? 'admin'
                  : normalizedToken.role?.toLowerCase() === 'superadmin' ? 'superadmin'
                  : 'customer') as UserRole;

      // Tạo user object từ token
      const user = this.createUserFromToken(normalizedToken);

      // Tạo AuthResponse object với token, role, user
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
      if (errorMessage.toLowerCase().includes('network')) {
        errorMessage = 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
      }
      
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
   * @returns User data, role, và JWT token
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      // Lưu token vào localStorage và set Authorization header
      if (response.data.token) {
        apiClient.setToken(response.data.token);
      }
      
      return response.data;
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
