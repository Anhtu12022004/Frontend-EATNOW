import { apiClient, ApiError } from './api';
import { Payment, PaymentApiResponse } from '../types';

/**
 * Chuyển đổi Payment response từ backend
 */
function mapPaymentResponse(apiResponse: PaymentApiResponse): Payment {
  return {
    id: apiResponse.id,
    order_id: apiResponse.order_id,
    amount: apiResponse.amount,
    payment_method: apiResponse.payment_method,
    status: apiResponse.status as Payment['status'],
    paid_at: apiResponse.paid_at
  };
}

interface CreatePaymentRequest {
  order_id: number;
  amount: number;
  payment_method: string; // 'CASH', 'MOMO', 'CARD', 'TRANSFER'
}

/**
 * Interface cho request tạo payment mới (API mới)
 */
interface CreateCustomerPaymentRequest {
  orderId: string;
  paymentMethod: string; // 'Tiền mặt', 'Ngân hàng', 'Momo'
}

/**
 * Interface cho response tạo payment
 */
interface CreatePaymentResponse {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  orderId: string;
}

class PaymentService {
  /**
   * Tạo thanh toán cho đơn hàng
   */
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    try {
      const response = await apiClient.post<PaymentApiResponse>('/payments', data);
      return mapPaymentResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating payment:', apiError);
      throw new Error(apiError.message || 'Không thể tạo thanh toán');
    }
  }

  /**
   * Lấy thông tin thanh toán theo ID
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    try {
      const response = await apiClient.get<PaymentApiResponse>(`/payments/${paymentId}`);
      return mapPaymentResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching payment:', apiError);
      throw new Error(apiError.message || 'Không thể tải thông tin thanh toán');
    }
  }

  /**
   * Lấy thanh toán theo đơn hàng
   */
  async getPaymentByOrderId(orderId: string): Promise<Payment> {
    try {
      const response = await apiClient.get<PaymentApiResponse>(`/orders/${orderId}/payment`);
      return mapPaymentResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching payment by order:', apiError);
      throw new Error(apiError.message || 'Không thể tải thông tin thanh toán');
    }
  }

  /**
   * Cập nhật trạng thái thanh toán (cho admin/staff)
   */
  async updatePaymentStatus(paymentId: string, status: Payment['status']): Promise<Payment> {
    try {
      const response = await apiClient.put<PaymentApiResponse>(`/payments/${paymentId}/status`, {
        status
      });
      return mapPaymentResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating payment status:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật trạng thái thanh toán');
    }
  }

  /**
   * Xác nhận thanh toán thành công
   */
  async confirmPayment(paymentId: string): Promise<Payment> {
    return this.updatePaymentStatus(paymentId, 'SUCCESS');
  }

  /**
   * Đánh dấu thanh toán thất bại
   */
  async failPayment(paymentId: string): Promise<Payment> {
    return this.updatePaymentStatus(paymentId, 'FAILED');
  }

  /**
   * Lấy danh sách thanh toán theo chi nhánh (cho admin)
   */
  async getPaymentsByBranch(branchId: string, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Payment[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.startDate) queryParams.startDate = params.startDate;
      if (params?.endDate) queryParams.endDate = params.endDate;

      const response = await apiClient.get<PaymentApiResponse[]>(
        `/branches/${branchId}/payments`,
        queryParams
      );
      return response.data.map(mapPaymentResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching branch payments:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách thanh toán');
    }
  }

  /**
   * Tính tổng doanh thu theo chi nhánh
   */
  async getBranchRevenue(branchId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ total: number; count: number }> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.startDate) queryParams.startDate = params.startDate;
      if (params?.endDate) queryParams.endDate = params.endDate;

      const response = await apiClient.get<{ total: number; count: number }>(
        `/branches/${branchId}/revenue`,
        queryParams
      );
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching branch revenue:', apiError);
      throw new Error(apiError.message || 'Không thể tải doanh thu');
    }
  }

  /**
   * Lấy tất cả thanh toán (SuperAdmin)
   */
  async getAllPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    branchId?: string;
  }): Promise<Payment[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = String(params.page);
      if (params?.limit) queryParams.limit = String(params.limit);
      if (params?.status) queryParams.status = params.status;
      if (params?.branchId) queryParams.branchId = params.branchId;

      const response = await apiClient.get<PaymentApiResponse[]>('/payments', queryParams);
      return response.data.map(mapPaymentResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching all payments:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách thanh toán');
    }
  }

  /**
   * Tạo thanh toán từ tablet khách hàng tại quán
   * POST /api/eatnow/payment
   * @param data Thông tin thanh toán (orderId, paymentMethod)
   * @returns Thông tin thanh toán vừa tạo
   */
  async createCustomerPayment(data: CreateCustomerPaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const response = await apiClient.post<CreatePaymentResponse>('/eatnow/payment', data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating customer payment:', apiError);
      throw new Error(apiError.message || 'Không thể tạo thanh toán');
    }
  }
}

export const paymentService = new PaymentService();
export type { CreateCustomerPaymentRequest, CreatePaymentResponse };