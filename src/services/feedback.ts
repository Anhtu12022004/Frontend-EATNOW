import { apiClient, ApiError } from './api';
import { Feedback, FeedbackApiResponse } from '../types';

/**
 * Chuyển đổi Feedback response từ backend
 */
function mapFeedbackResponse(apiResponse: FeedbackApiResponse): Feedback {
  return {
    id: apiResponse.id,
    user_id: apiResponse.user_id,
    order_id: apiResponse.order_id,
    branch_dish_id: apiResponse.branch_dish_id,
    rating: apiResponse.rating,
    comment: apiResponse.comment,
    is_visible: apiResponse.is_visible,
    created_at: apiResponse.created_at
  };
}

interface CreateFeedbackRequest {
  order_id: number;
  branch_dish_id?: number | null; // null nếu đánh giá chi nhánh
  rating: number; // 1-5
  comment: string;
}

class FeedbackService {
  /**
   * Tạo đánh giá mới
   */
  async createFeedback(data: CreateFeedbackRequest): Promise<Feedback> {
    try {
      const response = await apiClient.post<FeedbackApiResponse>('/feedback', data);
      return mapFeedbackResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating feedback:', apiError);
      throw new Error(apiError.message || 'Không thể gửi đánh giá');
    }
  }

  /**
   * Đánh giá đơn hàng (branch)
   */
  async rateOrder(orderId: number, rating: number, comment: string): Promise<Feedback> {
    return this.createFeedback({
      order_id: orderId,
      branch_dish_id: null,
      rating,
      comment
    });
  }

  /**
   * Đánh giá món ăn
   */
  async rateDish(orderId: number, branchDishId: number, rating: number, comment: string): Promise<Feedback> {
    return this.createFeedback({
      order_id: orderId,
      branch_dish_id: branchDishId,
      rating,
      comment
    });
  }

  /**
   * Lấy đánh giá theo ID
   */
  async getFeedbackById(feedbackId: string): Promise<Feedback> {
    try {
      const response = await apiClient.get<FeedbackApiResponse>(`/feedback/${feedbackId}`);
      return mapFeedbackResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching feedback:', apiError);
      throw new Error(apiError.message || 'Không thể tải đánh giá');
    }
  }

  /**
   * Lấy đánh giá của đơn hàng
   */
  async getFeedbackByOrder(orderId: string): Promise<Feedback[]> {
    try {
      const response = await apiClient.get<FeedbackApiResponse[]>(`/orders/${orderId}/feedback`);
      return response.data.map(mapFeedbackResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching order feedback:', apiError);
      throw new Error(apiError.message || 'Không thể tải đánh giá đơn hàng');
    }
  }

  /**
   * Lấy đánh giá của chi nhánh
   */
  async getFeedbackByBranch(branchId: string, params?: {
    page?: number;
    limit?: number;
    isVisible?: boolean;
  }): Promise<Feedback[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = String(params.page);
      if (params?.limit) queryParams.limit = String(params.limit);
      if (params?.isVisible !== undefined) queryParams.isVisible = String(params.isVisible);

      const response = await apiClient.get<FeedbackApiResponse[]>(
        `/branches/${branchId}/feedback`,
        queryParams
      );
      return response.data.map(mapFeedbackResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching branch feedback:', apiError);
      throw new Error(apiError.message || 'Không thể tải đánh giá chi nhánh');
    }
  }

  /**
   * Lấy đánh giá của món ăn
   */
  async getFeedbackByDish(branchDishId: string): Promise<Feedback[]> {
    try {
      const response = await apiClient.get<FeedbackApiResponse[]>(
        `/dishes/${branchDishId}/feedback`
      );
      return response.data.map(mapFeedbackResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching dish feedback:', apiError);
      throw new Error(apiError.message || 'Không thể tải đánh giá món ăn');
    }
  }

  /**
   * Ẩn/hiện đánh giá (Admin)
   */
  async toggleFeedbackVisibility(feedbackId: string, isVisible: boolean): Promise<Feedback> {
    try {
      const response = await apiClient.put<FeedbackApiResponse>(
        `/feedback/${feedbackId}/visibility`,
        { is_visible: isVisible }
      );
      return mapFeedbackResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error toggling feedback visibility:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật trạng thái đánh giá');
    }
  }

  /**
   * Xóa đánh giá (Admin)
   */
  async deleteFeedback(feedbackId: string): Promise<void> {
    try {
      await apiClient.delete(`/feedback/${feedbackId}`);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error deleting feedback:', apiError);
      throw new Error(apiError.message || 'Không thể xóa đánh giá');
    }
  }

  /**
   * Lấy tất cả đánh giá (SuperAdmin)
   */
  async getAllFeedback(params?: {
    page?: number;
    limit?: number;
    isVisible?: boolean;
    branchId?: string;
  }): Promise<Feedback[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = String(params.page);
      if (params?.limit) queryParams.limit = String(params.limit);
      if (params?.isVisible !== undefined) queryParams.isVisible = String(params.isVisible);
      if (params?.branchId) queryParams.branchId = params.branchId;

      const response = await apiClient.get<FeedbackApiResponse[]>('/feedback', queryParams);
      return response.data.map(mapFeedbackResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching all feedback:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách đánh giá');
    }
  }

  /**
   * Lấy thống kê đánh giá của chi nhánh
   */
  async getBranchRatingStats(branchId: string): Promise<{
    average: number;
    total: number;
    distribution: Record<number, number>;
  }> {
    try {
      const response = await apiClient.get<{
        average: number;
        total: number;
        distribution: Record<number, number>;
      }>(`/branches/${branchId}/rating-stats`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching rating stats:', apiError);
      throw new Error(apiError.message || 'Không thể tải thống kê đánh giá');
    }
  }
}

export const feedbackService = new FeedbackService();
