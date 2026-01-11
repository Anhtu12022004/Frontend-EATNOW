import { apiClient, ApiError } from './api';

// ============ INTERFACES ============

/**
 * Response từ API khi lấy order history
 */
export interface OrderItemInfo {
  id: string;
  name: string;
  isCommented: boolean;
  quantity: number;
  unitPrice: number;
  orderId: string;
  branchDishId: string;
}

export interface CustomerOrderResponse {
  id: string;
  totalPrice: number;
  orderTime: string;
  status: string;
  userId: string;
  branchId: string;
  branchName: string;
  tableNumber: number;
  orderItemInfos: OrderItemInfo[];
}

/**
 * Request để cập nhật thông tin customer
 */
export interface UpdateCustomerRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
}

/**
 * Request để gửi feedback/rating
 */
export interface CreateFeedbackRequest {
  rating: number;
  comment: string;
  orderId: string;
  branchDishId: string;
}

/**
 * Response khi tạo feedback
 */
export interface FeedbackResponse {
  id: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  userId: string;
  orderId: string;
  branchDishId: string;
}

// ============ SERVICE ============

class CustomerService {
  /**
   * Cập nhật thông tin customer
   */
  async updateProfile(data: UpdateCustomerRequest): Promise<void> {
    try {
      await apiClient.put('/eatnow/user/customer', data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating customer profile:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật thông tin');
    }
  }

  /**
   * Lấy lịch sử đơn hàng của customer
   */
  async getOrderHistory(userId: string): Promise<CustomerOrderResponse[]> {
    try {
      const response = await apiClient.get<CustomerOrderResponse[]>(`/eatnow/orders/user/${userId}`);
      return response.data || [];
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching order history:', apiError);
      throw new Error(apiError.message || 'Không thể tải lịch sử đơn hàng');
    }
  }

  /**
   * Gửi đánh giá món ăn
   */
  async submitFeedback(data: CreateFeedbackRequest): Promise<FeedbackResponse> {
    try {
      const response = await apiClient.post<FeedbackResponse>('/eatnow/feedback', data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error submitting feedback:', apiError);
      throw new Error(apiError.message || 'Không thể gửi đánh giá');
    }
  }
}

export const customerService = new CustomerService();
