import { apiClient, ApiError } from './api';
import { Reservation, ReservationApiResponse, Table, TableApiResponse } from '../types';

/**
 * Interface cho request lấy danh sách bàn theo thời gian
 */
interface GetTablesForReservationRequest {
  reservationDayTime: string; // ISO datetime
  branchId: string;
}

/**
 * Interface cho response bàn từ API reservation/tables
 */
interface ReservationTableResponse {
  id: string;
  tableNumber: number;
  capacity: number;
  reservationStatus: 'AVAILABLE' | 'RESERVED';
  branchId: string;
}

/**
 * Interface cho request tạo đặt bàn mới
 */
interface CreatePublicReservationRequest {
  phoneNumber: string;
  fullName: string;
  reservationTime: string; // ISO datetime
  numberOfPeople: number;
  branchId: string;
  tableNumber: number;
}

/**
 * Interface cho response tạo đặt bàn
 */
interface CreatePublicReservationResponse {
  reservationId: string;
  status: string;
}

/**
 * Chuyển đổi Reservation response từ backend sang format frontend
 */
function mapReservationResponse(apiResponse: ReservationApiResponse): Reservation {
  return {
    id: String(apiResponse.id),
    user_id: apiResponse.user_id,
    branch_id: apiResponse.branch_id,
    table_id: apiResponse.table_id,
    reservation_time: apiResponse.reservation_time,
    number_of_people: apiResponse.number_of_people,
    status: apiResponse.status as Reservation['status'],
    seats: apiResponse.number_of_people,
    date: new Date(apiResponse.reservation_time)
  };
}

/**
 * Chuyển đổi Table response từ backend
 */
function mapTableResponse(apiResponse: TableApiResponse): Table {
  return {
    id: String(apiResponse.id),
    branch_id: apiResponse.branch_id,
    table_number: apiResponse.table_number,
    capacity: apiResponse.capacity,
    status: apiResponse.status as Table['status'],
    number: String(apiResponse.table_number),
    seats: apiResponse.capacity,
    branchId: String(apiResponse.branch_id)
  };
}

interface CreateReservationRequest {
  branch_id: number;
  table_id?: number | null;
  reservation_time: string; // ISO datetime
  number_of_people: number;
}

class ReservationService {
  /**
   * Tạo đặt bàn mới
   */
  async createReservation(data: CreateReservationRequest): Promise<Reservation> {
    try {
      const response = await apiClient.post<ReservationApiResponse>('/reservations', data);
      return mapReservationResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating reservation:', apiError);
      throw new Error(apiError.message || 'Không thể đặt bàn');
    }
  }

  /**
   * Lấy thông tin đặt bàn theo ID
   */
  async getReservationById(reservationId: string): Promise<Reservation> {
    try {
      const response = await apiClient.get<ReservationApiResponse>(`/reservations/${reservationId}`);
      return mapReservationResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching reservation:', apiError);
      throw new Error(apiError.message || 'Không thể tải thông tin đặt bàn');
    }
  }

  /**
   * Lấy danh sách đặt bàn của user hiện tại
   */
  async getMyReservations(): Promise<Reservation[]> {
    try {
      const response = await apiClient.get<ReservationApiResponse[]>('/reservations/my-reservations');
      return response.data.map(mapReservationResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching my reservations:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách đặt bàn');
    }
  }

  /**
   * Lấy đặt bàn theo chi nhánh (cho admin/staff)
   */
  async getReservationsByBranch(branchId: string, params?: {
    status?: string;
    date?: string;
  }): Promise<Reservation[]> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.date) queryParams.date = params.date;

      const response = await apiClient.get<ReservationApiResponse[]>(
        `/branches/${branchId}/reservations`,
        queryParams
      );
      return response.data.map(mapReservationResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching branch reservations:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách đặt bàn');
    }
  }

  /**
   * Cập nhật trạng thái đặt bàn
   */
  async updateReservationStatus(
    reservationId: string, 
    status: Reservation['status']
  ): Promise<Reservation> {
    try {
      const response = await apiClient.put<ReservationApiResponse>(
        `/reservations/${reservationId}/status`,
        { status }
      );
      return mapReservationResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating reservation status:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật trạng thái đặt bàn');
    }
  }

  /**
   * Hủy đặt bàn
   */
  async cancelReservation(reservationId: string): Promise<void> {
    try {
      await apiClient.put(`/reservations/${reservationId}/status`, {
        status: 'CANCELLED'
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error cancelling reservation:', apiError);
      throw new Error(apiError.message || 'Không thể hủy đặt bàn');
    }
  }

  /**
   * Xác nhận đặt bàn (Admin)
   */
  async confirmReservation(reservationId: string, tableId: number): Promise<Reservation> {
    try {
      const response = await apiClient.put<ReservationApiResponse>(
        `/reservations/${reservationId}/confirm`,
        { table_id: tableId }
      );
      return mapReservationResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error confirming reservation:', apiError);
      throw new Error(apiError.message || 'Không thể xác nhận đặt bàn');
    }
  }

  // ============ TABLE MANAGEMENT ============

  /**
   * Lấy danh sách bàn của chi nhánh
   */
  async getTablesByBranch(branchId: string): Promise<Table[]> {
    try {
      const response = await apiClient.get<TableApiResponse[]>(`/branches/${branchId}/tables`);
      return response.data.map(mapTableResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching tables:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách bàn');
    }
  }

  /**
   * Lấy bàn trống của chi nhánh theo thời gian
   */
  async getAvailableTables(branchId: string, datetime: string, numberOfPeople: number): Promise<Table[]> {
    try {
      const response = await apiClient.get<TableApiResponse[]>(
        `/branches/${branchId}/tables/available`,
        {
          datetime,
          numberOfPeople: String(numberOfPeople)
        }
      );
      return response.data.map(mapTableResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching available tables:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách bàn trống');
    }
  }

  /**
   * Cập nhật trạng thái bàn
   */
  async updateTableStatus(tableId: string, status: Table['status']): Promise<Table> {
    try {
      const response = await apiClient.put<TableApiResponse>(`/tables/${tableId}/status`, {
        status
      });
      return mapTableResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating table status:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật trạng thái bàn');
    }
  }

  /**
   * Tạo bàn mới (Admin)
   */
  async createTable(data: {
    branch_id: number;
    table_number: number;
    capacity: number;
  }): Promise<Table> {
    try {
      const response = await apiClient.post<TableApiResponse>('/tables', data);
      return mapTableResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating table:', apiError);
      throw new Error(apiError.message || 'Không thể tạo bàn');
    }
  }

  /**
   * Xóa bàn (Admin)
   */
  async deleteTable(tableId: string): Promise<void> {
    try {
      await apiClient.delete(`/tables/${tableId}`);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error deleting table:', apiError);
      throw new Error(apiError.message || 'Không thể xóa bàn');
    }
  }

  // ============ PUBLIC RESERVATION (Không cần đăng nhập) ============

  /**
   * Lấy danh sách bàn theo thời gian đặt (Public API)
   * POST /api/eatnow/reservation/tables
   */
  async getTablesForReservation(data: GetTablesForReservationRequest): Promise<ReservationTableResponse[]> {
    try {
      const response = await apiClient.post<ReservationTableResponse[]>(
        '/eatnow/reservation/tables',
        data
      );
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching tables for reservation:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách bàn');
    }
  }

  /**
   * Tạo đặt bàn công khai (không cần đăng nhập)
   * POST /api/eatnow/reservation
   */
  async createPublicReservation(data: CreatePublicReservationRequest): Promise<CreatePublicReservationResponse> {
    try {
      const response = await apiClient.post<CreatePublicReservationResponse>(
        '/eatnow/reservation',
        data
      );
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating public reservation:', apiError);
      throw new Error(apiError.message || 'Không thể đặt bàn');
    }
  }
}

export const reservationService = new ReservationService();
export type { ReservationTableResponse, CreatePublicReservationRequest, CreatePublicReservationResponse };
