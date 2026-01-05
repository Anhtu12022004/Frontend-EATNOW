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
}

/**
 * Chuyển đổi response từ backend sang format frontend
 * @param apiResponse Response từ API
 * @returns Branch object cho frontend
 */
function mapBranchResponse(apiResponse: BranchApiResponse): Branch {
  return {
    id: String(apiResponse.id),
    name: apiResponse.name,
    address: apiResponse.address,
    phone: apiResponse.phone,
    image: apiResponse.image_url,
    image_url: apiResponse.image_url,
    status: apiResponse.status,
    open_time: apiResponse.open_time,
    close_time: apiResponse.close_time,
    // Computed field: ghép open_time và close_time thành hours
    hours: `${formatTime(apiResponse.open_time)} - ${formatTime(apiResponse.close_time)}`,
    // Các field mặc định (có thể được cập nhật sau từ API khác)
    rating: 4.5,
    district: extractDistrict(apiResponse.address)
  };
}

/**
 * Format time từ "HH:mm:ss" sang "HH:mm"
 */
function formatTime(time: string): string {
  if (!time) return '';
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
      const queryParams: Record<string, string> = {};
      
      if (params?.page) queryParams.page = String(params.page);
      if (params?.limit) queryParams.limit = String(params.limit);
      if (params?.district) queryParams.district = params.district;
      if (params?.search) queryParams.search = params.search;
      if (params?.sortBy) queryParams.sortBy = params.sortBy;
      if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

      //const response = await apiClient.get<BranchApiResponse[]>('/branches', queryParams);
      const response = await apiClient.get<BranchApiResponse[]>('/branch');
      // Map response từ backend sang format frontend
      return response.data.map(mapBranchResponse);
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
      const response = await apiClient.get<BranchApiResponse>(`/branches/${branchId}`);
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
}

export const branchService = new BranchService();
