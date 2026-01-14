import { apiClient, ApiError } from './api';

// ============ Staff API Types ============

// Response từ API GET /users/staff/branch/{branchId}
export interface StaffApiResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  address: string;
  createdAt: string;
  position: string;
}

// Request tạo staff mới POST /user/staff
export interface CreateStaffRequest {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  branchId: string;
}

// Request cập nhật staff PUT /user/staff
export interface UpdateStaffRequest {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  isActive: boolean;
  branchId: string;
}

// Staff model cho frontend
export interface BranchStaff {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  position: string;
  createdAt: Date;
}

// Position constants
export const STAFF_POSITIONS = [
  { value: 'PHỤC VỤ', label: 'Phục vụ' },
  { value: 'ĐẦU BẾP', label: 'Đầu bếp' },
  { value: 'THU NGÂN', label: 'Thu ngân' },
  { value: 'PHA CHẾ', label: 'Pha chế' },
] as const;

// Position priority for sorting
const POSITION_PRIORITY: Record<string, number> = {
  'ĐẦU BẾP': 1,
  'PHA CHẾ': 2,
  'THU NGÂN': 3,
  'PHỤC VỤ': 4,
};

/**
 * Map API response to frontend model
 */
function mapStaffResponse(apiResponse: StaffApiResponse): BranchStaff {
  return {
    id: apiResponse.id,
    fullName: apiResponse.fullName,
    email: apiResponse.email,
    phone: apiResponse.phone,
    address: apiResponse.address,
    status: apiResponse.status,
    position: apiResponse.position,
    createdAt: new Date(apiResponse.createdAt),
  };
}

/**
 * Sort staff by position
 */
function sortByPosition(staffList: BranchStaff[]): BranchStaff[] {
  return [...staffList].sort((a, b) => {
    const priorityA = POSITION_PRIORITY[a.position] || 99;
    const priorityB = POSITION_PRIORITY[b.position] || 99;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // If same position, sort by name
    return a.fullName.localeCompare(b.fullName, 'vi');
  });
}

class StaffService {
  /**
   * Lấy danh sách nhân viên theo chi nhánh
   * GET /users/staff/branch/{branchId}
   */
  async getStaffByBranch(branchId: string): Promise<BranchStaff[]> {
    try {
      const response = await apiClient.get<StaffApiResponse[]>(
        `/eatnow/users/staff/branch/${branchId}`
      );
      
      // Filter out ADMIN and map to frontend model
      const staffList = response.data
        .filter(staff => staff.position !== 'ADMIN')
        .map(mapStaffResponse);
      
      // Sort by position
      return sortByPosition(staffList);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching staff:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách nhân viên');
    }
  }

  /**
   * Thêm nhân viên mới
   * POST /user/staff
   */
  async createStaff(data: CreateStaffRequest): Promise<BranchStaff> {
    try {
      const response = await apiClient.post<StaffApiResponse>(
        '/eatnow/user/staff',
        data
      );
      return mapStaffResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating staff:', apiError);
      throw new Error(apiError.message || 'Không thể thêm nhân viên');
    }
  }

  /**
   * Cập nhật thông tin nhân viên
   * PUT /user/staff
   */
  async updateStaff(data: UpdateStaffRequest): Promise<BranchStaff> {
    try {
      const response = await apiClient.put<StaffApiResponse>(
        '/eatnow/user/staff',
        data
      );
      return mapStaffResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating staff:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật thông tin nhân viên');
    }
  }
}

export const staffService = new StaffService();
