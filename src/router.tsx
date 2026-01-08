import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { LandingPage } from "./components/pages/LandingPage";
import { BranchListPage } from "./components/pages/BranchListPage";
import { MenuPage } from "./components/pages/MenuPage";
import { CheckoutPage } from "./components/pages/CheckoutPage";
import { OrderConfirmationPage } from "./components/pages/OrderConfirmationPage";
import { AuthPage } from "./components/pages/AuthPage";
import { ProfilePage } from "./components/pages/ProfilePage";
import { TableReservationPage } from "./components/pages/TableReservationPage";
import { ForgotPasswordPage } from "./components/pages/ForgotPasswordPage";
import { StaffDashboard } from "./components/pages/StaffDashboard";
import { AdminDashboard } from "./components/pages/AdminDashboard";
import { SuperAdminDashboard } from "./components/pages/SuperAdminDashboard";
import { MenuManagement } from "./components/pages/MenuManagement";
import { StaffManagement } from "./components/pages/StaffManagement";
import { useAuth } from "./contexts/AuthContext";
import { useCart } from "./hooks/useCart";
import { CartSheet } from "./components/cart/CartSheet";
import { useState } from "react";
import {
  branches,
  mockTables,
  mockOrders,
  mockRatings,
  mockReservations,
} from "./data/mockData";
import { toast } from "sonner";

// Layout component for customer pages
function CustomerLayout() {
  const { isLoggedIn, user, logout } = useAuth();
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    setCartOpen(false);
    window.location.href = "/checkout";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartCount={cart.itemCount}
        onCartClick={() => setCartOpen(true)}
        isLoggedIn={isLoggedIn}
        customer={user ?? undefined}
        onLogin={() => (window.location.href = "/auth")}
        onLogout={logout}
        onProfile={() => (window.location.href = "/profile")}
        onReservation={() => (window.location.href = "/reservation")}
        onLogoClick={() => (window.location.href = "/")}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart.items}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

// Layout component for dashboard pages (no header/footer)
function DashboardLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.id)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Page wrapper components with necessary props
function LandingPageWrapper() {
  const cart = useCart();

  return (
    <LandingPage
      onViewMenu={(branchId) => (window.location.href = `/menu/${branchId}`)}
      onAddToCart={(item) => {
        cart.addItem(item);
        toast.success("Đã thêm vào giỏ hàng", { description: item.name });
      }}
      onViewBranches={() => (window.location.href = "/branches")}
    />
  );
}

function BranchListPageWrapper() {
  return (
    <BranchListPage
      onViewMenu={(branchId) => (window.location.href = `/menu/${branchId}`)}
    />
  );
}

function MenuPageWrapper() {
  const cart = useCart();
  const branchId = window.location.pathname.split("/")[2] || "1";

  return (
    <MenuPage
      branchId={branchId}
      onBack={() => window.history.back()}
      onAddToCart={(item) => {
        cart.addItem(item);
        toast.success("Đã thêm vào giỏ hàng", { description: item.name });
      }}
      onOpenCart={() => {}}
      cartCount={cart.itemCount}
    />
  );
}

function CheckoutPageWrapper() {
  const cart = useCart();

  return (
    <CheckoutPage
      items={cart.items}
      onBack={() => window.history.back()}
      onConfirm={(data) => {
        const orderId =
          "ORD" + Math.random().toString(36).substring(2, 9).toUpperCase();
        cart.clearCart();
        toast.success("Đơn hàng đã được xác nhận!", {
          description: `Mã đơn hàng: ${orderId}`,
        });
        window.location.href = `/order-confirmation/${orderId}`;
      }}
    />
  );
}

function OrderConfirmationPageWrapper() {
  const orderId = window.location.pathname.split("/")[2] || "";

  return (
    <OrderConfirmationPage
      orderId={orderId}
      onViewOrders={() => (window.location.href = "/profile")}
      onBackToHome={() => (window.location.href = "/")}
    />
  );
}

function AuthPageWrapper() {
  const { login } = useAuth();

  return (
    <AuthPage
      onLogin={(email, password) => {
        login(email, password);
        window.location.href = "/";
      }}
      onRegister={(name, email, phone, password) => {
        // Handle register
        window.location.href = "/";
      }}
      onBack={() => (window.location.href = "/")}
      onForgotPassword={() => (window.location.href = "/forgot-password")}
    />
  );
}

function ForgotPasswordPageWrapper() {
  const registeredEmails = [
    "nguyenvana@gmail.com",
    "tranthib@gmail.com",
    "staff@eatnow.vn",
    "admin@eatnow.vn",
  ];

  return (
    <ForgotPasswordPage
      onBack={() => (window.location.href = "/auth")}
      onSuccess={() => (window.location.href = "/auth")}
      registeredEmails={registeredEmails}
    />
  );
}

function ProfilePageWrapper() {
  const { user, logout, updateProfile } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ProfilePage
      customer={user}
      onBack={() => (window.location.href = "/")}
      onUpdate={updateProfile}
      onLogout={() => {
        logout();
        window.location.href = "/";
      }}
      orders={mockOrders.filter((o) => o.customerId === user.id)}
      onRatingSubmit={(rating) => {
        toast.success("Cảm ơn bạn đã đánh giá!");
      }}
    />
  );
}

function TableReservationPageWrapper() {
  const { user } = useAuth();

  if (!user) {
    toast.error("Vui lòng đăng nhập để đặt bàn");
    return <Navigate to="/auth" replace />;
  }

  return (
    <TableReservationPage
      branches={branches}
      tables={mockTables}
      customer={user}
      onBack={() => window.history.back()}
      onReservationCreate={(reservation) => {
        toast.success("Đặt bàn thành công!");
        window.location.href = "/profile";
      }}
    />
  );
}

// Dashboard wrappers
function StaffDashboardWrapper() {
  return <StaffDashboard />;
}

function AdminDashboardWrapper() {
  const [adminPage, setAdminPage] = useState<"dashboard" | "menu" | "staff">(
    "dashboard"
  );
  const { user } = useAuth();

  if (adminPage === "menu") {
    return (
      <MenuManagement
        onBack={() => setAdminPage("dashboard")}
        branchId={user?.branchId || undefined}
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
      ratings={mockRatings}
      onApproveRating={(id) => toast.success("Đã duyệt đánh giá")}
      onHideRating={(id) => toast.info("Đã ẩn đánh giá")}
      onDeleteRating={(id) => toast.success("Đã xóa đánh giá")}
    />
  );
}

function SuperAdminDashboardWrapper() {
  return (
    <SuperAdminDashboard
      orders={mockOrders}
      ratings={mockRatings}
      onApproveRating={(id) => toast.success("Đã duyệt đánh giá")}
      onHideRating={(id) => toast.info("Đã ẩn đánh giá")}
      onDeleteRating={(id) => toast.success("Đã xóa đánh giá")}
    />
  );
}

// Router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: <CustomerLayout />,
    children: [
      { index: true, element: <LandingPageWrapper /> },
      { path: "branches", element: <BranchListPageWrapper /> },
      { path: "menu/:branchId?", element: <MenuPageWrapper /> },
      { path: "checkout", element: <CheckoutPageWrapper /> },
      {
        path: "order-confirmation/:orderId",
        element: <OrderConfirmationPageWrapper />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePageWrapper />
          </ProtectedRoute>
        ),
      },
      {
        path: "reservation",
        element: (
          <ProtectedRoute>
            <TableReservationPageWrapper />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthPageWrapper />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPageWrapper />,
  },
  {
    path: "/staff",
    element: <DashboardLayout />,
    children: [{ index: true, element: <StaffDashboardWrapper /> }],
  },
  {
    path: "/admin",
    element: <DashboardLayout />,
    children: [{ index: true, element: <AdminDashboardWrapper /> }],
  },
  {
    path: "/superadmin",
    element: <DashboardLayout />,
    children: [{ index: true, element: <SuperAdminDashboardWrapper /> }],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
