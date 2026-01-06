// =============================================
// DATABASE MODELS - Phù hợp với schema backend
// =============================================

// ============ ROLES ============
export interface Role {
  id: number;
  name: string;
}

export interface RoleApiResponse {
  id: number;
  name: string;
}

// ============ USERS ============
export interface User {
  id: string | number;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  role_id?: number;
  role?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  created_at?: string | Date;
  // Frontend computed
  name?: string; // alias for full_name
  avatar?: string;
}

export interface UserApiResponse {
  id: number;
  full_name: string;
  email: string;
  password_hash?: string;
  phone: string;
  address: string;
  role_id: number;
  status: string;
  created_at: string;
}

export type UserRole = 'guest' | 'customer' | 'staff' | 'admin' | 'superadmin';

// Customer là alias của User cho frontend
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  joinedDate: Date;
  status?: string;
}

// ============ BRANCHES ============
export interface Branch {
  id: string | number;
  name: string;
  address: string;
  phone?: string;
  image_url?: string;
  image?: string;
  status?: string;
  open_time?: string;
  close_time?: string;
  // Computed fields
  hours?: string;
  district?: string;
  rating?: number;
  distance?: number;
}

export interface BranchApiResponse {
  id: number;
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  status: string;
  openTime: string;
  closeTime: string;
}

// ============ TABLES ============
export interface Table {
  id: string | number;
  branch_id: number;
  table_number: number;
  capacity: number;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED';
  // Frontend computed
  number?: string;
  seats?: number;
  area?: string;
  branchId?: string;
}

export interface TableApiResponse {
  id: number;
  branch_id: number;
  table_number: number;
  capacity: number;
  status: string;
}

// ============ CATEGORIES ============
export interface Category {
  id: string | number;
  name: string;
  is_active: boolean;
}

export interface CategoryApiResponse {
  id: number;
  name: string;
  is_active: boolean;
}

// ============ DISHES ============
export interface Dish {
  id: string | number;
  category_id: number;
  name: string;
  description: string;
  image_url: string;
  price: number;
  is_active: boolean;
  best_seller: boolean;
  is_new: boolean;
  // Frontend computed
  image?: string;
  category?: string;
  available?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
}

export interface DishApiResponse {
  id: number;
  category_id: number;
  name: string;
  description: string;
  image_url: string;
  price: number;
  is_active: boolean;
  best_seller: boolean;
  is_new: boolean;
}

// MenuItem là alias cho Dish trong frontend
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  categoryId?: number;
}

// ============ BRANCH_DISHES ============
export interface BranchDish {
  id: number;
  branch_id: number;
  dish_id: number;
  price: number;
  is_available: boolean;
  // Joined fields
  dish?: Dish;
}

export interface BranchDishApiResponse {
  id: number;
  branch_id: number;
  dish_id: number;
  price: number;
  is_available: boolean;
}

// ============ RESERVATIONS ============
export interface Reservation {
  id: string | number;
  user_id: number;
  branch_id: number;
  table_id?: number | null;
  reservation_time: string | Date;
  number_of_people: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  // Frontend computed
  reservationCode?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  branchName?: string;
  tableNumber?: string;
  date?: Date;
  time?: string;
  seats?: number;
  notes?: string;
  createdAt?: Date;
}

export interface ReservationApiResponse {
  id: number;
  user_id: number;
  branch_id: number;
  table_id: number | null;
  reservation_time: string;
  number_of_people: number;
  status: string;
}

// ============ ORDERS ============
export interface Order {
  id: string | number;
  user_id: number;
  branch_id: number;
  table_id?: number | null;
  total_price: number;
  order_time: string | Date;
  status: 'NEW' | 'PREPARING' | 'PAID' | 'CANCELLED';
  // Frontend computed
  customerId?: string;
  customerName?: string;
  branchName?: string;
  items?: OrderItem[];
  total?: number;
  paymentMethod?: string;
  createdAt?: Date;
  notes?: string;
  hasRated?: boolean;
}

export interface OrderApiResponse {
  id: number;
  user_id: number;
  branch_id: number;
  table_id: number | null;
  total_price: number;
  order_time: string;
  status: string;
}

// ============ ORDER_ITEMS ============
export interface OrderItem {
  id: number;
  order_id: number;
  branch_dish_id: number;
  quantity: number;
  unit_price: number;
  // Joined fields
  dish?: Dish;
  name?: string;
  price?: number;
}

export interface OrderItemApiResponse {
  id: number;
  order_id: number;
  branch_dish_id: number;
  quantity: number;
  unit_price: number;
}

// CartItem cho frontend
export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
  branchDishId?: number;
}

// ============ PAYMENTS ============
export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  payment_method: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paid_at?: string | Date;
}

export interface PaymentApiResponse {
  id: number;
  order_id: number;
  amount: number;
  payment_method: string;
  status: string;
  paid_at: string;
}

// ============ STAFF_ASSIGNMENTS ============
export interface StaffAssignment {
  id: number;
  staff_id: number;
  branch_id: number;
  position: 'ADMIN' | 'CHEF' | 'WAITER';
  start_date: string | Date;
  end_date?: string | Date | null;
  // Joined fields
  staff?: User;
  branch?: Branch;
}

export interface StaffAssignmentApiResponse {
  id: number;
  staff_id: number;
  branch_id: number;
  position: string;
  start_date: string;
  end_date: string | null;
}

// Staff cho frontend (computed từ User + StaffAssignment)
export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  position?: string;
  avatar?: string;
  status: string;
  joinedDate: Date;
  branchId: string;
}

// ============ FEEDBACK ============
export interface Feedback {
  id: number;
  user_id: number;
  order_id: number;
  branch_dish_id?: number | null;
  rating: number;
  comment: string;
  is_visible: boolean;
  created_at: string | Date;
  // Joined fields
  user?: User;
  dish?: Dish;
}

export interface FeedbackApiResponse {
  id: number;
  user_id: number;
  order_id: number;
  branch_dish_id: number | null;
  rating: number;
  comment: string;
  is_visible: boolean;
  created_at: string;
}

// Rating cho frontend (alias của Feedback)
export interface Rating {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  branchId: string;
  branchName: string;
  type: 'dish' | 'branch';
  dishId?: string;
  dishName?: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment: string;
  images?: string[];
  createdAt: Date;
  status: 'pending' | 'approved' | 'hidden';
  isVisible?: boolean;
}
