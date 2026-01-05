import { apiClient, ApiError } from './api';
import { User, UserApiResponse, StaffAssignment, StaffAssignmentApiResponse } from '../types';

/**
 * Chuyển đổi User response từ backend
 */
function mapUserResponse(apiResponse: UserApiResponse): User {
  return {
    id: String(apiResponse.id),
    full_name: apiResponse.full_name,
    name: apiResponse.full_name,
    email: apiResponse.email,
    phone: apiResponse.phone,
    address: apiResponse.address,
    role_id: apiResponse.role_id,
    status: apiResponse.status as User['status'],
    created_at: apiResponse.created_at
  };
}

/**
 * Chuyển đổi StaffAssignment response
 */
function mapStaffAssignmentResponse(apiResponse: StaffAssignmentApiResponse): StaffAssignment {
  return {
    id: apiResponse.id,
    staff_id: apiResponse.staff_id,
    branch_id: apiResponse.branch_id,
    position: apiResponse.position as StaffAssignment['position'],
    start_date: apiResponse.start_date,
    end_date: apiResponse.end_date
  };
}

interface CreateUserRequest {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role_id: number;
}

interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role_id?: number;
  status?: string;
}

class UserService {
  // ============ USER CRUD ============

  /**
   * Lấy danh sách tất cả users (Admin)
   */
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    roleId?: number;
    status?: string;
  }): Promise<User[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = String(params.page);
      if (params?.limit) queryParams.limit = String(params.limit);
      if (params?.roleId) queryParams.roleId = String(params.roleId);
      if (params?.status) queryParams.status = params.status;

      const response = await apiClient.get<UserApiResponse[]>('/users', queryParams);
      return response.data.map(mapUserResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching users:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách người dùng');
    }
  }

  /**
   * Lấy user theo ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await apiClient.get<UserApiResponse>(`/users/${userId}`);
      return mapUserResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching user:', apiError);
      throw new Error(apiError.message || 'Không thể tải thông tin người dùng');
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  async getMe(): Promise<User> {
    try {
      const response = await apiClient.get<UserApiResponse>('/users/me');
      return mapUserResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching current user:', apiError);
      throw new Error(apiError.message || 'Không thể tải thông tin tài khoản');
    }
  }

  /**
   * Tạo user mới (Admin)
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      const response = await apiClient.post<UserApiResponse>('/users', data);
      return mapUserResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating user:', apiError);
      throw new Error(apiError.message || 'Không thể tạo người dùng');
    }
  }

  /**
   * Cập nhật user
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put<UserApiResponse>(`/users/${userId}`, data);
      return mapUserResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating user:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật người dùng');
    }
  }

  /**
   * Cập nhật profile của user hiện tại
   */
  async updateMyProfile(data: {
    full_name?: string;
    phone?: string;
    address?: string;
  }): Promise<User> {
    try {
      const response = await apiClient.put<UserApiResponse>('/users/me', data);
      return mapUserResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating profile:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật thông tin');
    }
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    try {
      await apiClient.put('/users/me/password', {
        current_password: data.currentPassword,
        new_password: data.newPassword
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error changing password:', apiError);
      throw new Error(apiError.message || 'Không thể đổi mật khẩu');
    }
  }

  /**
   * Xóa user (Admin)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}`);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error deleting user:', apiError);
      throw new Error(apiError.message || 'Không thể xóa người dùng');
    }
  }

  /**
   * Kích hoạt/Vô hiệu hóa user
   */
  async toggleUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'): Promise<User> {
    try {
      const response = await apiClient.put<UserApiResponse>(`/users/${userId}/status`, {
        status
      });
      return mapUserResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error toggling user status:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật trạng thái người dùng');
    }
  }

  // ============ STAFF MANAGEMENT ============

  /**
   * Lấy danh sách staff
   */
  async getAllStaff(): Promise<User[]> {
    try {
      // Lấy users với role_id = 2 (STAFF) hoặc 3 (ADMIN)
      const response = await apiClient.get<UserApiResponse[]>('/users', {
        roleId: '2,3' // staff, admin
      });
      return response.data.map(mapUserResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching staff:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách nhân viên');
    }
  }

  /**
   * Lấy staff theo chi nhánh
   */
  async getStaffByBranch(branchId: string): Promise<(User & { assignment?: StaffAssignment })[]> {
    try {
      const response = await apiClient.get<(UserApiResponse & { 
        assignment?: StaffAssignmentApiResponse 
      })[]>(`/branches/${branchId}/staff`);
      
      return response.data.map(item => ({
        ...mapUserResponse(item),
        assignment: item.assignment ? mapStaffAssignmentResponse(item.assignment) : undefined
      }));
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching branch staff:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách nhân viên chi nhánh');
    }
  }

  // ============ STAFF ASSIGNMENT ============

  /**
   * Gán nhân viên vào chi nhánh
   */
  async assignStaffToBranch(data: {
    staff_id: number;
    branch_id: number;
    position: 'ADMIN' | 'CHEF' | 'WAITER';
    start_date: string;
  }): Promise<StaffAssignment> {
    try {
      const response = await apiClient.post<StaffAssignmentApiResponse>(
        '/staff-assignments',
        data
      );
      return mapStaffAssignmentResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error assigning staff:', apiError);
      throw new Error(apiError.message || 'Không thể gán nhân viên');
    }
  }

  /**
   * Cập nhật assignment
   */
  async updateStaffAssignment(assignmentId: number, data: {
    position?: 'ADMIN' | 'CHEF' | 'WAITER';
    end_date?: string;
  }): Promise<StaffAssignment> {
    try {
      const response = await apiClient.put<StaffAssignmentApiResponse>(
        `/staff-assignments/${assignmentId}`,
        data
      );
      return mapStaffAssignmentResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating staff assignment:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật phân công');
    }
  }

  /**
   * Kết thúc assignment (chuyển nhân viên)
   */
  async endStaffAssignment(assignmentId: number): Promise<void> {
    try {
      await apiClient.put(`/staff-assignments/${assignmentId}`, {
        end_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error ending staff assignment:', apiError);
      throw new Error(apiError.message || 'Không thể kết thúc phân công');
    }
  }

  /**
   * Lấy lịch sử phân công của nhân viên
   */
  async getStaffAssignmentHistory(staffId: string): Promise<StaffAssignment[]> {
    try {
      const response = await apiClient.get<StaffAssignmentApiResponse[]>(
        `/users/${staffId}/assignments`
      );
      return response.data.map(mapStaffAssignmentResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching assignment history:', apiError);
      throw new Error(apiError.message || 'Không thể tải lịch sử phân công');
    }
  }

  // ============ ROLES ============

  /**
   * Lấy danh sách roles
   */
  async getRoles(): Promise<{ id: number; name: string }[]> {
    try {
      const response = await apiClient.get<{ id: number; name: string }[]>('/roles');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching roles:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách vai trò');
    }
  }
}

export const userService = new UserService();
