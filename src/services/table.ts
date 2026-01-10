import { apiClient, ApiError } from './api';

/**
 * Interface cho request kiểm tra bàn
 */
interface CheckTableAvailabilityRequest {
  tableNumber: number;
  branchId: string;
}

/**
 * Interface cho response kiểm tra bàn
 */
interface CheckTableAvailabilityResponse {
  isAvailable: boolean;
  tableNumber: number;
  branchId: string;
  message: string;
}

class TableService {
  /**
   * Kiểm tra bàn có hợp lệ/available không
   * POST /api/eatnow/table/check-availability
   * @param tableNumber Số bàn
   * @param branchId ID chi nhánh
   * @returns Thông tin trạng thái bàn
   */
  async checkTableAvailability(
    tableNumber: number,
    branchId: string
  ): Promise<CheckTableAvailabilityResponse> {
    try {
      const response = await apiClient.post<CheckTableAvailabilityResponse>(
        '/eatnow/table/check-availability',
        {
          tableNumber,
          branchId,
        }
      );
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error checking table availability:', apiError);
      throw new Error(apiError.message || 'Không thể kiểm tra trạng thái bàn');
    }
  }
}

export const tableService = new TableService();
export type { CheckTableAvailabilityRequest, CheckTableAvailabilityResponse };
