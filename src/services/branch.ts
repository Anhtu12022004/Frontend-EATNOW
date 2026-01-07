import { apiClient, ApiError } from './api';
import { Branch, BranchApiResponse } from '../types';

/**
 * Interface cho response từ API branches
 */
interface BranchListResponse {
  branches: Branch[];
  total: number;
}

interface BranchQueryParams {
  page?: number;
  limit?: number;
  district?: string;
  search?: string;
  sortBy?: 'rating' | 'distance' | 'name';
  sortOrder?: 'asc' | 'desc';
  active?: boolean; // Nếu true, chỉ lấy chi nhánh có status = "ACTIVE"
}

/**
 * Chuyển đổi response từ backend sang format frontend
 * @param apiResponse Response từ API
 * @returns Branch object cho frontend
 */
function mapBranchResponse(apiResponse: BranchApiResponse): Branch {
  console.log('API Response branch:', apiResponse);
  return {
    id: String(apiResponse.id),
    name: apiResponse.name,
    address: apiResponse.address,
    phone: apiResponse.phone,
    image: apiResponse.imageUrl,
    image_url: apiResponse.imageUrl,
    status: apiResponse.status,
    open_time: apiResponse.openTime,
    close_time: apiResponse.closeTime,
    // Computed field: ghép open_time và close_time thành hours
    hours: `${formatTime(apiResponse.openTime)} - ${formatTime(apiResponse.closeTime)}`,
    // Các field mặc định (có thể được cập nhật sau từ API khác)
    rating: 4.5,
    district: extractDistrict(apiResponse.address)
  };
}

/**
 * Format time từ "HH:mm:ss" sang "HH:mm"
 */
function formatTime(time: string): string {
  // if (!time) return '';
  // Nếu format là "HH:mm:ss", chỉ lấy "HH:mm"
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
}

/**
 * Trích xuất quận/huyện từ địa chỉ
 */
function extractDistrict(address: string): string {
  if (!address) return '';
  // Tìm pattern "Quận X" hoặc "Huyện X" trong địa chỉ
  const districtMatch = address.match(/Quận\s*\d+|Quận\s*[^,]+|Huyện\s*[^,]+/i);
  return districtMatch ? districtMatch[0].trim() : '';
}

class BranchService {
  /**
   * Lấy danh sách tất cả chi nhánh
   * @param params Query parameters để filter/sort
   * @returns Danh sách chi nhánh
   */
  async getAllBranches(params?: BranchQueryParams): Promise<Branch[]> {
    try {
      const response = await apiClient.get<BranchApiResponse[]>('/eatnow/branches');
      
      // Map response từ backend sang format frontend
      let branches = response.data.map(mapBranchResponse);
      
      // Nếu active = true, chỉ lấy chi nhánh có status = "ACTIVE"
      if (params?.active) {
        branches = branches.filter(branch => branch.status === 'ACTIVE');
      }
      
      // Nếu có limit parameter, chỉ lấy số lượng cần thiết
      if (params?.limit) {
        branches = branches.slice(0, params.limit);
      }
      
      return branches;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching branches:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách chi nhánh');
    }
  }

  /**
   * Lấy chi nhánh gần nhất (dựa vào distance)
   * @param limit Số lượng chi nhánh muốn lấy (mặc định 3)
   * @returns Danh sách chi nhánh gần nhất
   */
  async getNearbyBranches(limit: number = 3): Promise<Branch[]> {
    try {
      // Gọi API lấy tất cả branches và lấy số lượng theo limit
      const response = await apiClient.get<BranchApiResponse[]>('/branches', {
        limit: String(limit)
      });
      // Map response từ backend sang format frontend
      return response.data.map(mapBranchResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching nearby branches:', apiError);
      throw new Error(apiError.message || 'Không thể tải chi nhánh gần bạn');
    }
  }

  /**
   * Lấy thông tin chi tiết một chi nhánh
   * @param branchId ID của chi nhánh
   * @returns Thông tin chi nhánh
   */
  async getBranchById(branchId: string): Promise<Branch> {
    try {
      // API: http://localhost:5214/api/eatnow/branch/{id_branch}
      const response = await apiClient.get<BranchApiResponse>(`/eatnow/branch/${branchId}`);
      return mapBranchResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching branch:', apiError);
      throw new Error(apiError.message || 'Không thể tải thông tin chi nhánh');
    }
  }

  /**
   * Lấy chi nhánh theo quận/huyện
   * @param district Tên quận/huyện
   * @returns Danh sách chi nhánh trong quận
   */
  async getBranchesByDistrict(district: string): Promise<Branch[]> {
    try {
      const response = await apiClient.get<BranchApiResponse[]>('/branches', {
        district: district
      });
      return response.data.map(mapBranchResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching branches by district:', apiError);
      throw new Error(apiError.message || 'Không thể tải chi nhánh theo quận');
    }
  }

  /**
   * Tìm kiếm chi nhánh
   * @param keyword Từ khóa tìm kiếm
   * @returns Danh sách chi nhánh phù hợp
   */
  async searchBranches(keyword: string): Promise<Branch[]> {
    try {
      const response = await apiClient.get<BranchApiResponse[]>('/branches/search', {
        q: keyword
      });
      return response.data.map(mapBranchResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error searching branches:', apiError);
      throw new Error(apiError.message || 'Không thể tìm kiếm chi nhánh');
    }
  }

  /**
   * Thêm chi nhánh mới
   * @param data Thông tin chi nhánh mới
   * @returns Chi nhánh vừa tạo
   */
  async createBranch(data: {
    name: string;
    address: string;
    phone: string;
    imageUrl: string;
    openTime: string;
    closeTime: string;
  }): Promise<Branch> {
    try {
      const response = await apiClient.post<BranchApiResponse>('/eatnow/branch', data);
      return mapBranchResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating branch:', apiError);
      throw new Error(apiError.message || 'Không thể tạo chi nhánh mới');
    }
  }

  /**
   * Cập nhật chi nhánh
   * @param data Thông tin chi nhánh cần cập nhật
   * @returns Chi nhánh đã cập nhật
   */
  async updateBranch(data: {
    id: string;
    name: string;
    address: string;
    phone: string;
    imageUrl: string;
    status: string;
    openTime: string;
    closeTime: string;
  }): Promise<Branch> {
    try {
      const response = await apiClient.put<BranchApiResponse>('/eatnow/branch', data);
      return mapBranchResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating branch:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật chi nhánh');
    }
  }
}

export const branchService = new BranchService();
