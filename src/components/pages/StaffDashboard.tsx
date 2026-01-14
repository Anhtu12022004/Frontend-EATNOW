import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Package,
  CheckCircle,
  Bell,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { apiClient } from "../../services/api";
import { branchService } from "../../services/branch";
import { Branch } from "../../types";

// Types for API responses
interface OrderItemInfo {
  id: string;
  quantity: number;
  unitPrice: number;
  orderId: string;
  branchDishId: string;
}

interface BranchOrder {
  id: string;
  totalPrice: number;
  orderTime: string;
  status: "CONFIRMED" | "PREPARING" | "READY";
  userId: string;
  branchId: string;
  tableNumber: number;
  orderItemInfos: OrderItemInfo[];
}

interface BranchDishInfo {
  id: string;
  dishId: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  isBestSeller: boolean;
  isNew: boolean;
  isAvailable: boolean;
  category: string;
}

type OrderStatus = "CONFIRMED" | "PREPARING" | "READY";

interface StaffDashboardProps {
  onLogout?: () => void;
}

// Load branchId from localStorage auth data
function getStaffBranchId(): string | null {
  try {
    const authData = localStorage.getItem("eatnow_auth");
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.user?.branchId || null;
    }
  } catch {
    console.error("Error parsing auth data");
  }
  return null;
}

export function StaffDashboard({ onLogout }: StaffDashboardProps) {
  const [orders, setOrders] = useState<BranchOrder[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [dishCache, setDishCache] = useState<Record<string, BranchDishInfo>>(
    {}
  );

  const branchId = getStaffBranchId();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  const getTimeSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  // Fetch branch info
  const fetchBranchInfo = useCallback(async () => {
    if (!branchId) return;
    try {
      const branchData = await branchService.getBranchById(branchId);
      setBranch(branchData);
    } catch (error) {
      console.error("Error fetching branch info:", error);
      toast.error("Không thể tải thông tin chi nhánh");
    }
  }, [branchId]);

  // Fetch dish info by branchDishId
  const fetchDishInfo = useCallback(
    async (branchDishId: string): Promise<BranchDishInfo | null> => {
      // Check cache first
      if (dishCache[branchDishId]) {
        return dishCache[branchDishId];
      }

      try {
        const response = await apiClient.get<BranchDishInfo>(
          `/eatnow/branch-dish/${branchDishId}`
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching dish info:", error);
        return null;
      }
    },
    [dishCache]
  );

  // Fetch all dish info for orders
  const fetchAllDishInfo = useCallback(
    async (ordersList: BranchOrder[]) => {
      // Get all unique branchDishIds that are not in cache
      const allBranchDishIds = new Set<string>();
      ordersList.forEach((order) => {
        order.orderItemInfos.forEach((item) => {
          if (!dishCache[item.branchDishId]) {
            allBranchDishIds.add(item.branchDishId);
          }
        });
      });

      if (allBranchDishIds.size === 0) return;

      // Fetch all dish info in parallel
      const dishPromises = Array.from(allBranchDishIds).map(async (id) => {
        const dish = await fetchDishInfo(id);
        return { id, dish };
      });

      const results = await Promise.all(dishPromises);

      // Update cache with new dish info
      const newCache: Record<string, BranchDishInfo> = { ...dishCache };
      results.forEach(({ id, dish }) => {
        if (dish) {
          newCache[id] = dish;
        }
      });

      setDishCache(newCache);
    },
    [dishCache, fetchDishInfo]
  );

  // Fetch unpaid orders for branch
  const fetchOrders = useCallback(async () => {
    if (!branchId) return;
    try {
      const response = await apiClient.get<BranchOrder[]>(
        `/eatnow/orders/unpaid/branch/${branchId}`
      );
      // Sort by orderTime (oldest first to process in order)
      const sortedOrders = response.data.sort(
        (a, b) =>
          new Date(a.orderTime).getTime() - new Date(b.orderTime).getTime()
      );
      setOrders(sortedOrders);
      setLastRefresh(new Date());

      // Fetch dish info for all orders
      await fetchAllDishInfo(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  }, [branchId, fetchAllDishInfo]);

  // Update order status via API
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(orderId);
    try {
      await apiClient.put<BranchOrder>("/eatnow/order/status", {
        orderId,
        status: newStatus,
      });

      toast.success("Cập nhật trạng thái thành công");
      // Refresh orders after update
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setIsUpdating(null);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBranchInfo();
    fetchOrders();
  }, [fetchBranchInfo, fetchOrders]);

  // Auto refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      CONFIRMED: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      PREPARING: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      READY: "bg-green-100 text-green-800 hover:bg-green-200",
    };

    const labels: Record<OrderStatus, string> = {
      CONFIRMED: "Chờ xử lý",
      PREPARING: "Đang làm",
      READY: "Sẵn sàng",
    };

    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const ordersByStatus = {
    confirmed: orders.filter((o) => o.status === "CONFIRMED"),
    preparing: orders.filter((o) => o.status === "PREPARING"),
    ready: orders.filter((o) => o.status === "READY"),
  };

  const OrderCard = ({ order }: { order: BranchOrder }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="mb-1 font-medium">Đơn #{order.id.slice(0, 8)}</h4>
            <p className="text-sm text-muted-foreground">
              Bàn: {order.tableNumber || "N/A"}
            </p>
          </div>
          {getStatusBadge(order.status)}
        </div>

        <div className="space-y-2 mb-4">
          {order.orderItemInfos.map((item) => (
            <div key={item.id} className="text-sm flex justify-between">
              <span className="text-muted-foreground">
                {item.quantity}x{" "}
                {dishCache[item.branchDishId]?.name || "Đang tải..."}
              </span>
              <span>{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {getTimeSince(order.orderTime)}
          </div>
          <div style={{ fontWeight: 600 }}>{formatPrice(order.totalPrice)}</div>
        </div>

        <div className="flex gap-2">
          {order.status === "CONFIRMED" && (
            <Button
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => updateOrderStatus(order.id, "PREPARING")}
              disabled={isUpdating === order.id}
            >
              {isUpdating === order.id ? "Đang xử lý..." : "Bắt đầu chuẩn bị"}
            </Button>
          )}
          {order.status === "PREPARING" && (
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => updateOrderStatus(order.id, "READY")}
              disabled={isUpdating === order.id}
            >
              {isUpdating === order.id ? "Đang xử lý..." : "Đánh dấu sẵn sàng"}
            </Button>
          )}
          {order.status === "READY" && (
            <div className="text-sm text-muted-foreground w-full text-center py-2">
              Chờ khách thanh toán
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!branchId) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy thông tin chi nhánh. Vui lòng đăng nhập lại.
            </p>
            {onLogout && (
              <Button className="mt-4" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontSize: "28px" }}>Dashboard nhân viên</h1>
            <p className="text-muted-foreground">
              Quản lý đơn hàng tại chi nhánh {branch?.name || "Đang tải..."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fetchOrders()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Bell className="h-4 w-4 mr-2" />
              Thông báo
            </Button>
            {onLogout && (
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            )}
          </div>
        </div>

        {/* Last refresh info */}
        <p className="text-sm text-muted-foreground mb-4">
          Cập nhật lần cuối: {lastRefresh.toLocaleTimeString("vi-VN")} (tự động
          làm mới mỗi 10 giây)
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Chờ xử lý</div>
                  <div style={{ fontSize: "24px", fontWeight: 700 }}>
                    {ordersByStatus.confirmed.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Đang làm</div>
                  <div style={{ fontSize: "24px", fontWeight: 700 }}>
                    {ordersByStatus.preparing.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Sẵn sàng</div>
                  <div style={{ fontSize: "24px", fontWeight: 700 }}>
                    {ordersByStatus.ready.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="confirmed" className="space-y-4">
          <TabsList>
            <TabsTrigger value="confirmed">
              Chờ xử lý ({ordersByStatus.confirmed.length})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Đang làm ({ordersByStatus.preparing.length})
            </TabsTrigger>
            <TabsTrigger value="ready">
              Sẵn sàng ({ordersByStatus.ready.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="confirmed" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersByStatus.confirmed.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {ordersByStatus.confirmed.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Không có đơn hàng chờ xử lý
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preparing" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersByStatus.preparing.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {ordersByStatus.preparing.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Không có đơn hàng đang chuẩn bị
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ready" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersByStatus.ready.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {ordersByStatus.ready.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Không có đơn hàng sẵn sàng
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
