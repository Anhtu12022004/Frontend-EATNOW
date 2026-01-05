import { apiClient, ApiError } from './api';
import { Order, OrderApiResponse, OrderItem, OrderItemApiResponse, CartItem } from '../types';

/**
 * Chuyển đổi Order response từ backend sang format frontend
 */
function mapOrderResponse(apiResponse: OrderApiResponse & { items?: OrderItemApiResponse[] }): Order {
  return {
    id: String(apiResponse.id),
    user_id: apiResponse.user_id,
    branch_id: apiResponse.branch_id,
    table_id: apiResponse.table_id,
    total_price: apiResponse.total_price,
    order_time: apiResponse.order_time,
    status: apiResponse.status as Order['status'],
    total: apiResponse.total_price,
    createdAt: new Date(apiResponse.order_time),
    items: apiResponse.items?.map(mapOrderItemResponse)
  };
}

function mapOrderItemResponse(apiResponse: OrderItemApiResponse): OrderItem {
  return {
    id: apiResponse.id,
    order_id: apiResponse.order_id,
    branch_dish_id: apiResponse.branch_dish_id,
    quantity: apiResponse.quantity,
    unit_price: apiResponse.unit_price,
    price: apiResponse.unit_price
  };
}

interface CreateOrderRequest {
  branch_id: number;
  table_id?: number | null;
  items: {
    branch_dish_id: number;
    quantity: number;
    unit_price: number;
  }[];
  total_price: number;
}

class OrderService {
  /**
   * Tạo đơn hàng mới
   */
  async createOrder(order: CreateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.post<OrderApiResponse>('/orders', order);
      return mapOrderResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating order:', apiError);
      throw new Error(apiError.message || 'Không thể tạo đơn hàng');
    }
  }

  /**
   * Tạo đơn hàng từ cart
   */
  async createOrderFromCart(
    branchId: number,
    items: CartItem[],
    tableId?: number
  ): Promise<Order> {
    const orderItems = items.map(item => ({
      branch_dish_id: item.branchDishId || parseInt(item.id),
      quantity: item.quantity,
      unit_price: item.price
    }));

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return this.createOrder({
      branch_id: branchId,
      table_id: tableId || null,
      items: orderItems,
      total_price: totalPrice
    });
  }

  /**
   * Lấy đơn hàng theo ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get<OrderApiResponse>(`/orders/${orderId}`);
      return mapOrderResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching order:', apiError);
      throw new Error(apiError.message || 'Không thể tải thông tin đơn hàng');
    }
  }

  /**
   * Lấy danh sách đơn hàng của user hiện tại
   */
  async getMyOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get<OrderApiResponse[]>('/orders/my-orders');
      return response.data.map(mapOrderResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching my orders:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách đơn hàng');
    }
  }

  /**
   * Lấy đơn hàng theo chi nhánh (cho admin/staff)
   */
  async getOrdersByBranch(branchId: string, status?: string): Promise<Order[]> {
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      
      const response = await apiClient.get<OrderApiResponse[]>(
        `/branches/${branchId}/orders`,
        params
      );
      return response.data.map(mapOrderResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching branch orders:', apiError);
      throw new Error(apiError.message || 'Không thể tải đơn hàng chi nhánh');
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const response = await apiClient.put<OrderApiResponse>(`/orders/${orderId}/status`, {
        status
      });
      return mapOrderResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating order status:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật trạng thái đơn hàng');
    }
  }

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(orderId: string): Promise<void> {
    try {
      await apiClient.put(`/orders/${orderId}/status`, {
        status: 'CANCELLED'
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error cancelling order:', apiError);
      throw new Error(apiError.message || 'Không thể hủy đơn hàng');
    }
  }

  /**
   * Lấy tất cả đơn hàng (SuperAdmin)
   */
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    branchId?: string;
  }): Promise<Order[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = String(params.page);
      if (params?.limit) queryParams.limit = String(params.limit);
      if (params?.status) queryParams.status = params.status;
      if (params?.branchId) queryParams.branchId = params.branchId;

      const response = await apiClient.get<OrderApiResponse[]>('/orders', queryParams);
      return response.data.map(mapOrderResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching all orders:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách đơn hàng');
    }
  }
}

export const orderService = new OrderService();
