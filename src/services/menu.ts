import { apiClient, ApiError } from './api';
import { MenuItem, DishApiResponse, Category, CategoryApiResponse } from '../types';

/**
 * Interface cho response menu item kết hợp từ dish + branch_dish
 */
export interface MenuItemApiResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  category_name?: string;
  imageUrl: string;
  isActive: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  // From branch_dish join
  branch_dish_id?: number;
  branch_price?: number;
  is_available?: boolean;
}

/**
 * Interface cho response best seller dishes API (camelCase)
 */
export interface BestSellerDishApiResponse {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  isBestSeller: boolean;
  isNew: boolean;
  isActive: boolean;
  category: string;
}

/**
 * Interface cho response branch dishes API (camelCase)
 */
export interface BranchDishApiResponse {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  isBestSeller: boolean;
  isNew: boolean;
  isAvailable: boolean;
  category: string;
}

interface MenuQueryParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  branchId?: string;
  isBestseller?: boolean;
  isActive?: boolean;
}

/**
 * Chuyển đổi response từ backend sang format frontend
 * @param apiResponse Response từ API
 * @returns MenuItem object cho frontend
 */
function mapMenuItemResponse(apiResponse: MenuItemApiResponse | DishApiResponse): MenuItem {
  const dish = apiResponse as MenuItemApiResponse;
  return {
    id: String(dish.id),
    name: dish.name,
    description: dish.description || '',
    price: dish.branch_price || dish.price,
    category: dish.category_name || '',
    categoryId: dish.category_id,
    image: dish.image_url || '',
    available: dish.is_available ?? dish.is_active ?? true,
    bestSeller: dish.best_seller ?? false,
    isNew: dish.is_new ?? false
  };
}

class MenuService {
  /**
   * Lấy danh sách tất cả món ăn (dishes)
   * @param params Query parameters để filter
   * @returns Danh sách món ăn
   */
  async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      // const queryParams: Record<string, string> = {};
      
      // if (params?.page) queryParams.page = String(params.page);
      // if (params?.limit) queryParams.limit = String(params.limit);
      // if (params?.categoryId) queryParams.categoryId = String(params.categoryId);
      // if (params?.isBestseller !== undefined) queryParams.isBestseller = String(params.isBestseller);
      // if (params?.isActive !== undefined) queryParams.isActive = String(params.isActive);

      const response = await apiClient.get<MenuItemApiResponse[]>('/eatnow/dishes');

      // Map response từ backend sang format frontend
      let dishes = response.data.map(dish => ({
        id: dish.id,
        name: dish.name,
        description: dish.description || '',
        price: dish.price,
        category: dish.category || '',
        image: dish.imageUrl || '',
        available: dish.isActive,
        bestSeller: dish.isBestSeller,
        isNew: dish.isNew
      }));

      // Sort theo category
      dishes.sort((a, b) => a.category.localeCompare(b.category, 'vi'));

      return dishes;

    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching menu items:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh sách món ăn');
    }
  }

  /**
   * Lấy các món best seller
   * @param limit Số lượng món muốn lấy (mặc định 4)
   * @param isActive Nếu true, chỉ lấy món đang hoạt động
   * @returns Danh sách món best seller
   */
  async getBestSellerItems(limit: number = 4, isActive?: boolean): Promise<MenuItem[]> {
    try {
      const response = await apiClient.get<BestSellerDishApiResponse[]>('/eatnow/dishes/best-sellers');
      
      // Map response từ backend sang format frontend
      let dishes = response.data.map(dish => ({
        id: dish.id,
        name: dish.name,
        description: dish.description || '',
        price: dish.price,
        category: dish.category || '',
        image: dish.imageUrl || '',
        available: dish.isActive,
        bestSeller: dish.isBestSeller,
        isNew: dish.isNew
      }));
      
      // Nếu isActive = true, chỉ lấy món đang hoạt động
      if (isActive) {
        dishes = dishes.filter(dish => dish.available);
      }
      
      // Chỉ lấy số lượng cần thiết theo limit
      if (limit) {
        dishes = dishes.slice(0, limit);
      }
      
      return dishes;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching best seller items:', apiError);
      throw new Error(apiError.message || 'Không thể tải món nổi bật');
    }
  }

  /**
   * Lấy món ăn theo chi nhánh (từ bảng branch_dishes join dishes)
   * @param branchId ID chi nhánh
   * @returns Danh sách món ăn của chi nhánh
   */
  async getMenuItemsByBranch(branchId: string): Promise<MenuItem[]> {
    try {
      // http://localhost:5214/api/eatnow/branch-dishes/12ab344d-58ac-43bd-b3bb-e2fe1a3ac91a
      // API trả về: { data: [...dishes], message, success }
      // apiClient.get trả về ApiResponse<T> = { data: T, ... }
      // Nên response.data = { data: [...dishes], message, success }
      const response = await apiClient.get<{ data: BranchDishApiResponse[], message?: string, success: boolean }>(`/eatnow/branch-dishes/${branchId}`);
      
      // response.data.data là mảng dishes thực tế
      const dishes = response.data;
      
      // Map response từ backend sang format frontend
      return dishes.map((dish: BranchDishApiResponse) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description || '',
        price: dish.price,
        category: dish.category || '',
        image: dish.imageUrl || '',
        available: dish.isAvailable,
        bestSeller: dish.isBestSeller,
        isNew: dish.isNew
      }));
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching menu items by branch:', apiError);
      throw new Error(apiError.message || 'Không thể tải menu chi nhánh');
    }
  }

  /**
   * Lấy thông tin chi tiết một món ăn
   * @param dishId ID món ăn
   * @returns Thông tin món ăn
   */
  async getDishById(dishId: string): Promise<MenuItem> {
    try {
      const response = await apiClient.get<MenuItemApiResponse>(`/dishes/${dishId}`);
      return mapMenuItemResponse(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching dish:', apiError);
      throw new Error(apiError.message || 'Không thể tải thông tin món ăn');
    }
  }

  /**
   * Lấy danh sách categories
   * @returns Danh sách danh mục món ăn
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<CategoryApiResponse[]>('/categories');
      return response.data.map(cat => ({
        id: cat.id,
        name: cat.name,
        is_active: cat.is_active
      }));
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching categories:', apiError);
      throw new Error(apiError.message || 'Không thể tải danh mục');
    }
  }

  /**
   * Lấy món ăn theo category
   * @param categoryId ID danh mục
   * @returns Danh sách món ăn
   */
  async getDishesByCategory(categoryId: number): Promise<MenuItem[]> {
    try {
      const response = await apiClient.get<MenuItemApiResponse[]>('/dishes', {
        categoryId: String(categoryId)
      });
      return response.data.map(mapMenuItemResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching dishes by category:', apiError);
      throw new Error(apiError.message || 'Không thể tải món theo danh mục');
    }
  }

  /**
   * Tìm kiếm món ăn
   * @param keyword Từ khóa tìm kiếm
   * @returns Danh sách món phù hợp
   */
  async searchDishes(keyword: string): Promise<MenuItem[]> {
    try {
      const response = await apiClient.get<MenuItemApiResponse[]>('/dishes/search', {
        q: keyword
      });
      return response.data.map(mapMenuItemResponse);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error searching dishes:', apiError);
      throw new Error(apiError.message || 'Không thể tìm kiếm món ăn');
    }
  }

  // ============ ADMIN OPERATIONS ============

  /**
   * Tạo món ăn mới (Super Admin)
   * POST /api/eatnow/dish
   */
  async createDish(dish: {
    name: string;
    description: string;
    category: string;
    imageUrl: string;
    price: number;
    isBestSeller: boolean;
    isNew: boolean;
    isActive: boolean;
  }): Promise<MenuItem> {
    try {
      const response = await apiClient.post<BestSellerDishApiResponse>('/eatnow/dish', dish);
      const data = response.data;
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        price: data.price,
        category: data.category || '',
        image: data.imageUrl || '',
        available: data.isActive,
        bestSeller: data.isBestSeller,
        isNew: data.isNew
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating dish:', apiError);
      throw new Error(apiError.message || 'Không thể tạo món ăn');
    }
  }

  /**
   * Cập nhật món ăn (Super Admin)
   * PUT /api/eatnow/dish
   */
  async updateDish(dish: {
    id: string;
    name: string;
    description: string;
    category: string;
    imageUrl: string;
    price: number;
    isBestSeller: boolean;
    isNew: boolean;
    isActive: boolean;
  }): Promise<MenuItem> {
    try {
      const response = await apiClient.put<BestSellerDishApiResponse>('/eatnow/dish', dish);
      const data = response.data;
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        price: data.price,
        category: data.category || '',
        image: data.imageUrl || '',
        available: data.isActive,
        bestSeller: data.isBestSeller,
        isNew: data.isNew
      };
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating dish:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật món ăn');
    }
  }

  /**
   * Xóa món ăn
   * @param dishId ID món ăn
   */
  async deleteDish(dishId: string): Promise<void> {
    try {
      await apiClient.delete(`/dishes/${dishId}`);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error deleting dish:', apiError);
      throw new Error(apiError.message || 'Không thể xóa món ăn');
    }
  }

  /**
   * Thêm món vào chi nhánh (branch_dishes)
   */
  async addDishToBranch(branchId: string, dishId: number, price: number): Promise<void> {
    try {
      await apiClient.post(`/branches/${branchId}/dishes`, {
        dish_id: dishId,
        price: price,
        is_available: true
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error adding dish to branch:', apiError);
      throw new Error(apiError.message || 'Không thể thêm món vào chi nhánh');
    }
  }

  /**
   * Cập nhật giá món theo chi nhánh
   */
  async updateBranchDish(branchId: string, branchDishId: number, data: {
    price?: number;
    is_available?: boolean;
  }): Promise<void> {
    try {
      await apiClient.put(`/branches/${branchId}/dishes/${branchDishId}`, data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating branch dish:', apiError);
      throw new Error(apiError.message || 'Không thể cập nhật món chi nhánh');
    }
  }
}

export const menuService = new MenuService();
