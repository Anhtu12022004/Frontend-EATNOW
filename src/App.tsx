import { useState } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { LandingPage } from "./components/pages/LandingPage";
import { BranchListPage } from "./components/pages/BranchListPage";
import { MenuPage } from "./components/pages/MenuPage";
import { CheckoutPage } from "./components/pages/CheckoutPage";
import { OrderConfirmationPage } from "./components/pages/OrderConfirmationPage";
import { StaffDashboard } from "./components/pages/StaffDashboard";
import { AdminDashboard } from "./components/pages/AdminDashboard";
import { SuperAdminDashboard } from "./components/pages/SuperAdminDashboard";
import { MenuManagement } from "./components/pages/MenuManagement";
import { StaffManagement } from "./components/pages/StaffManagement";
import { AuthPage } from "./components/pages/AuthPage";
import { ProfilePage } from "./components/pages/ProfilePage";
import { TableReservationPage } from "./components/pages/TableReservationPage";
import { ForgotPasswordPage } from "./components/pages/ForgotPasswordPage";
import { CartSheet } from "./components/cart/CartSheet";
import {
  CartItem,
  MenuItem,
  UserRole,
  Customer,
  Order,
  Rating,
  Reservation,
} from "./types";
import {
  mockOrders,
  mockRatings,
  mockTables,
  mockReservations,
  branches,
} from "./data/mockData";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { authService } from "./services/auth";

type Page =
  | "landing"
  | "branches"
  | "menu"
  | "checkout"
  | "confirmation"
  | "auth"
  | "forgot-password"
  | "profile"
  | "reservation"
  | "staff-dashboard"
  | "admin-dashboard"
  | "admin-menu-management"
  | "admin-staff-management"
  | "superadmin-dashboard";

// Helper function to load auth from localStorage
const loadAuthFromStorage = (): { user: Customer | null; role: UserRole } => {
  try {
    const stored = localStorage.getItem("eatnow_auth");
    if (stored) {
      const data = JSON.parse(stored);
      return { user: data.user, role: data.role || "guest" };
    }
  } catch {
    // Ignore parse errors
  }
  return { user: null, role: "guest" };
};

// Helper function to save auth to localStorage
const saveAuthToStorage = (user: Customer | null, role: UserRole) => {
  if (user) {
    localStorage.setItem("eatnow_auth", JSON.stringify({ user, role }));
  } else {
    localStorage.removeItem("eatnow_auth");
  }
};

export default function App() {
  // Load initial state from localStorage
  const initialAuth = loadAuthFromStorage();

  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("1");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string>("");
  const [userRole, setUserRole] = useState<UserRole>(initialAuth.role);
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialAuth.user);
  const [customer, setCustomer] = useState<Customer | null>(initialAuth.user);
  const [adminPage, setAdminPage] = useState<"dashboard" | "menu" | "staff">(
    "dashboard"
  );
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [ratings, setRatings] = useState<Rating[]>(mockRatings);
  const [tables, setTables] = useState(mockTables);
  const [reservations, setReservations] =
    useState<Reservation[]>(mockReservations);

  // Cart functions
  const addToCart = (item: MenuItem) => {
    const existingItem = cartItems.find((ci) => ci.id === item.id);

    if (existingItem) {
      setCartItems(
        cartItems.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
      toast.success("Đã thêm vào giỏ hàng", {
        description: `${item.name} (${existingItem.quantity + 1})`,
      });
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
      toast.success("Đã thêm vào giỏ hàng", {
        description: item.name,
      });
    }
    setCartOpen(true);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
    toast.info("Đã xóa khỏi giỏ hàng");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    setCartOpen(false);
    setCurrentPage("checkout");
  };

  const handleConfirmOrder = (data: {
    branchId: string;
    paymentMethod: string;
    notes: string;
  }) => {
    const orderId =
      "ORD" + Math.random().toString(36).substring(2, 9).toUpperCase();
    setLastOrderId(orderId);
    setCartItems([]);
    setCurrentPage("confirmation");
    toast.success("Đơn hàng đã được xác nhận!", {
      description: `Mã đơn hàng: ${orderId}`,
    });
  };

  const handleViewMenu = (branchId: string) => {
    setSelectedBranchId(branchId);
    setCurrentPage("menu");
  };

  // Auth functions
  const handleLogin = async (email: string, password: string) => {
    // Validation
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu", {
        description: "Tất cả các trường bắt buộc",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email không hợp lệ", {
        description: "Vui lòng nhập email đúng định dạng",
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast.error("Mật khẩu không hợp lệ", {
        description: "Mật khẩu phải có ít nhất 6 ký tự",
      });
      return;
    }

    try {
      // Gọi API đăng nhập
      const response = await authService.login({ email, password });

      console.log("Login response:", response);

      // Lưu thông tin user và role vào state và localStorage
      setCustomer(response.user);
      setUserRole(response.role);
      setIsLoggedIn(true);
      saveAuthToStorage(response.user, response.role);

      // Chuyển hướng dựa trên vai trò
      const userRole = response.role;
      if (userRole === "customer" || userRole === "guest") {
        setCurrentPage("landing");
      }

      toast.success("Đăng nhập thành công!", {
        description: `Chào mừng ${response.user.name} (${
          userRole === "customer"
            ? "Khách hàng"
            : userRole === "staff"
            ? "Nhân viên"
            : userRole === "admin"
            ? "Quản trị viên"
            : "Super Admin"
        })`,
      });
    } catch (error) {
      // console.error('Login error1:', error);

      let errorMessage = "Đăng nhập thất bại";
      let errorDescription = "Vui lòng thử lại";

      if (error instanceof Error) {
        errorDescription = error.message;
      }

      // Hiển thị thông báo lỗi
      toast.error(errorMessage, {
        description: errorDescription,
      });
    }
    // const response = await authService.login({ email, password });

    // Mock login - Determine role based on email pattern
    // In production, role will come from backend response

    // let role: UserRole = 'customer';
    // let mockCustomer: Customer;

    // if (email.includes('superadmin')) {
    //   role = 'superadmin';
    //   mockCustomer = {
    //     id: 'sa1',
    //     name: 'Super Admin',
    //     email: email,
    //     phone: '0900000001',
    //     address: 'EATNOW Headquarters',
    //     joinedDate: new Date('2023-01-01')
    //   };
    // } else if (email.includes('admin')) {
    //   role = 'admin';
    //   mockCustomer = {
    //     id: 'a1',
    //     name: 'Admin User',
    //     email: email,
    //     phone: '0900000002',
    //     address: 'EATNOW Branch Office',
    //     joinedDate: new Date('2023-06-01')
    //   };
    // } else if (email.includes('staff')) {
    //   role = 'staff';
    //   mockCustomer = {
    //     id: 's1',
    //     name: 'Staff User',
    //     email: email,
    //     phone: '0900000003',
    //     address: 'EATNOW Store',
    //     joinedDate: new Date('2024-01-01')
    //   };
    // } else {
    //   role = 'customer';
    //   mockCustomer = {
    //     id: 'c1',
    //     name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    //     email: email,
    //     phone: '0901234567',
    //     address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    //     joinedDate: new Date()
    //   };
    // }

    // // Save to state and localStorage
    // setCustomer(mockCustomer);
    // setUserRole(role);
    // setIsLoggedIn(true);
    // saveAuthToStorage(mockCustomer, role);

    // setCustomer(response.user);
    // setUserRole(response.role);
    // setIsLoggedIn(true);
    // saveAuthToStorage(response.user, response.role);
    // const role = response.role;

    // // Navigate based on role
    // if (role === 'customer' || role === 'guest') {
    //   setCurrentPage('landing');
    // }
    // // Staff/Admin/SuperAdmin will automatically show their dashboard via renderContent

    // toast.success('Đăng nhập thành công!', {
    //   description: `Chào mừng ${response.user.name} (${role === 'customer' ? 'Khách hàng' : role === 'staff' ? 'Nhân viên' : role === 'admin' ? 'Quản trị viên' : 'Super Admin'})`
    // });
  };

  const handleRegister = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<{ success: boolean; email?: string }> => {
    try {
      const response = await authService.register({
        fullName: name,
        email,
        phone,
        password,
      });

      // Trả về success để AuthPage chuyển sang tab login
      return {
        success: true,
        email: response.email,
      };
    } catch (error) {
      let errorMessage = "Đăng ký thất bại";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error("Đăng ký thất bại", {
        description: errorMessage,
      });

      return { success: false };
    }
  };

  const handleLogout = () => {
    setCustomer(null);
    setUserRole("guest");
    setIsLoggedIn(false);
    setCartItems([]);
    setAdminPage("dashboard");
    saveAuthToStorage(null, "guest");
    setCurrentPage("landing");
    toast.info("Đã đăng xuất");
  };

  const handleUpdateProfile = (updatedCustomer: Customer) => {
    setCustomer(updatedCustomer);
  };

  const handleRatingSubmit = (
    rating: Omit<Rating, "id" | "createdAt" | "status">
  ) => {
    // Create new rating
    const newRating: Rating = {
      ...rating,
      id: "RAT" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      createdAt: new Date(),
      status: "pending",
    };

    setRatings([...ratings, newRating]);

    // Update order's hasRated flag
    setOrders(
      orders.map((order) =>
        order.id === rating.orderId ? { ...order, hasRated: true } : order
      )
    );
  };

  const handleApproveRating = (ratingId: string) => {
    setRatings(
      ratings.map((rating) =>
        rating.id === ratingId
          ? { ...rating, status: "approved" as const }
          : rating
      )
    );
  };

  const handleHideRating = (ratingId: string) => {
    setRatings(
      ratings.map((rating) =>
        rating.id === ratingId
          ? { ...rating, status: "hidden" as const }
          : rating
      )
    );
  };

  const handleDeleteRating = (ratingId: string) => {
    setRatings(ratings.filter((rating) => rating.id !== ratingId));
  };

  const handleReservationCreate = (
    reservation: Omit<Reservation, "id" | "reservationCode" | "createdAt">
  ) => {
    const newReservation: Reservation = {
      ...reservation,
      id: "RES" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      reservationCode: "EAT" + Date.now().toString().slice(-9),
      createdAt: new Date(),
    };

    setReservations([...reservations, newReservation]);

    // Update table status to reserved
    setTables(
      tables.map((table) =>
        table.id === reservation.tableId
          ? { ...table, status: "reserved" as const }
          : table
      )
    );
  };

  // Render content based on current page and user role
  const renderContent = () => {
    // Role-based dashboards (only when logged in with specific roles)
    if (isLoggedIn && userRole === "staff") {
      return <StaffDashboard onLogout={handleLogout} />;
    }

    if (isLoggedIn && userRole === "admin") {
      if (adminPage === "menu") {
        return (
          <MenuManagement
            onBack={() => setAdminPage("dashboard")}
            branchId={customer?.branchId || undefined}
          />
        );
      }
      if (adminPage === "staff") {
        return <StaffManagement onBack={() => setAdminPage("dashboard")} />;
      }
      return (
        <AdminDashboard
          onNavigateToMenu={() => setAdminPage("menu")}
          onNavigateToStaff={() => setAdminPage("staff")}
          ratings={ratings}
          onApproveRating={handleApproveRating}
          onHideRating={handleHideRating}
          onDeleteRating={handleDeleteRating}
          onLogout={handleLogout}
        />
      );
    }

    if (isLoggedIn && userRole === "superadmin") {
      return (
        <SuperAdminDashboard
          orders={orders}
          ratings={ratings}
          onApproveRating={handleApproveRating}
          onHideRating={handleHideRating}
          onDeleteRating={handleDeleteRating}
          onLogout={handleLogout}
        />
      );
    }

    // Customer/Guest pages
    switch (currentPage) {
      case "auth":
        return (
          <AuthPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            onBack={() => setCurrentPage("landing")}
            onForgotPassword={() => setCurrentPage("forgot-password")}
          />
        );

      case "forgot-password":
        // Get list of registered emails for validation
        const registeredEmails = [
          "nguyenvana@gmail.com",
          "tranthib@gmail.com",
          "lequangc@gmail.com",
          "phamthid@gmail.com",
          "staff@eatnow.vn",
          "admin@eatnow.vn",
          "superadmin@eatnow.vn",
        ];

        return (
          <ForgotPasswordPage
            onBack={() => setCurrentPage("auth")}
            onSuccess={() => setCurrentPage("auth")}
            registeredEmails={registeredEmails}
          />
        );

      case "profile":
        if (!customer) {
          setCurrentPage("auth");
          return null;
        }
        return (
          <ProfilePage
            customer={customer}
            onBack={() => setCurrentPage("landing")}
            onUpdate={handleUpdateProfile}
            onLogout={handleLogout}
            orders={orders}
            onRatingSubmit={handleRatingSubmit}
          />
        );

      case "reservation":
        if (!customer) {
          setCurrentPage("auth");
          toast.error("Vui lòng đăng nhập để đặt bàn");
          return null;
        }
        return (
          <TableReservationPage
            branches={branches}
            tables={tables}
            customer={customer}
            onBack={() => setCurrentPage("landing")}
            onReservationCreate={handleReservationCreate}
          />
        );

      case "branches":
        return <BranchListPage onViewMenu={handleViewMenu} />;

      case "menu":
        return (
          <MenuPage
            branchId={selectedBranchId}
            onBack={() => setCurrentPage("landing")}
            onAddToCart={addToCart}
            onOpenCart={() => setCartOpen(true)}
            cartCount={cartItems.length}
          />
        );

      case "checkout":
        return (
          <CheckoutPage
            items={cartItems}
            onBack={() => setCurrentPage("menu")}
            onConfirm={handleConfirmOrder}
          />
        );

      case "confirmation":
        return (
          <OrderConfirmationPage
            orderId={lastOrderId}
            onViewOrders={() => toast.info("Chức năng đang phát triển")}
            onBackToHome={() => setCurrentPage("landing")}
          />
        );

      case "landing":
      default:
        return (
          <LandingPage
            onViewMenu={handleViewMenu}
            onAddToCart={addToCart}
            onViewBranches={() => setCurrentPage("branches")}
          />
        );
    }
  };

  const showHeaderFooter =
    userRole === "customer" || userRole === "guest" || !isLoggedIn;

  return (
    <div className="min-h-screen flex flex-col">
      {showHeaderFooter && (
        <Header
          cartCount={cartItems.length}
          onCartClick={() => setCartOpen(true)}
          isLoggedIn={isLoggedIn}
          customer={customer || undefined}
          onLogin={() => setCurrentPage("auth")}
          onLogout={handleLogout}
          onProfile={() => setCurrentPage("profile")}
          onReservation={() => setCurrentPage("reservation")}
        />
      )}

      <main className="flex-1">{renderContent()}</main>

      {showHeaderFooter && <Footer />}

      {/* Cart Sheet */}
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </div>
  );
}
