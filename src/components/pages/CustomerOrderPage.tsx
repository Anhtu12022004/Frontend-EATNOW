import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Store,
  Phone,
  User,
  ShoppingCart,
  Check,
  Clock,
  ChefHat,
  UtensilsCrossed,
  CreditCard,
  Banknote,
  Wallet,
  ArrowLeft,
  ArrowRight,
  ChevronsUpDown,
  Plus,
  Minus,
  RefreshCw,
  CheckCircle2,
  Loader2,
  Coffee,
  Star,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Branch, MenuItem } from "../../types";
import { branchService } from "../../services/branch";
import { menuService } from "../../services/menu";
import { tableService } from "../../services/table";
import { authService } from "../../services/auth";
import { orderService, OrderDetailResponse } from "../../services/order";
import { paymentService, CreatePaymentResponse } from "../../services/payment";
import { DishDetailDialog, RatingStars, calculateAverageRating } from "./DishDetailDialog";

// Interface for dish feedback
interface DishFeedback {
  id: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  userId: string;
  orderId: string;
  branchDishId: string;
}

// Flow steps
type OrderStep =
  | "select-branch"
  | "customer-info"
  | "menu"
  | "order-status"
  | "payment"
  | "complete";

// Order status mapping
const ORDER_STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  CONFIRMED: { label: "Đã xác nhận", color: "bg-primary", icon: <Check className="h-5 w-5" /> },
  PREPARING: { label: "Đang chuẩn bị", color: "bg-amber-500", icon: <ChefHat className="h-5 w-5" /> },
  READY: { label: "Sẵn sàng", color: "bg-green-500", icon: <UtensilsCrossed className="h-5 w-5" /> },
  PAID: { label: "Đã thanh toán", color: "bg-primary", icon: <CheckCircle2 className="h-5 w-5" /> },
};

// Payment methods
const PAYMENT_METHODS = [
  { id: "Tiền mặt", label: "Tiền mặt", icon: <Banknote className="h-6 w-6" /> },
  { id: "Ngân hàng", label: "Chuyển khoản ngân hàng", icon: <CreditCard className="h-6 w-6" /> },
  { id: "Momo", label: "Ví MoMo", icon: <Wallet className="h-6 w-6" /> },
];

// Cart item interface
interface CartItem extends MenuItem {
  quantity: number;
}

export function CustomerOrderPage() {
  // Flow state
  const [currentStep, setCurrentStep] = useState<OrderStep>("select-branch");

  // Branch selection state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);

  // Table state
  const [tableNumber, setTableNumber] = useState<string>("");
  const [checkingTable, setCheckingTable] = useState(false);

  // Customer info state
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Menu state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showConfirmOrder, setShowConfirmOrder] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Order state
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetailResponse | null>(null);
  const [orderMenuItems, setOrderMenuItems] = useState<Map<string, MenuItem>>(new Map());

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<CreatePaymentResponse | null>(null);

  // Polling interval ref
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dish detail dialog state
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [showDishDetail, setShowDishDetail] = useState(false);

  // Dish ratings cache
  const [dishRatings, setDishRatings] = useState<Map<string, number>>(new Map());

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Always show all standard categories
  const standardCategories = ["Khai vị", "Món chính", "Đồ uống", "Tráng miệng", "Món đặc biệt"];
  const categories = ["all", ...standardCategories];

  // Filter menu items by category
  const filteredMenuItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  // Fetch ratings for all menu items
  const fetchDishRatings = useCallback(async (items: MenuItem[]) => {
    const ratingsMap = new Map<string, number>();
    
    // Fetch ratings in parallel for all items
    const ratingPromises = items.map(async (item) => {
      try {
        const response = await fetch(
          `http://localhost:5214/api/eatnow/feedbacks/dish/${item.id}`,
          { headers: { 'accept': '*/*' } }
        );
        
        if (response.ok) {
          const data: DishFeedback[] = await response.json();
          const rating = calculateAverageRating(data);
          return { id: item.id, rating };
        }
      } catch (error) {
        console.error(`Error fetching rating for dish ${item.id}:`, error);
      }
      return { id: item.id, rating: 0 };
    });

    const results = await Promise.all(ratingPromises);
    results.forEach(({ id, rating }) => {
      ratingsMap.set(id, rating);
    });

    setDishRatings(ratingsMap);
  }, []);

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoadingBranches(true);
        const data = await branchService.getAllBranches({ active: true });
        setBranches(data);
      } catch (error) {
        console.error("Error loading branches:", error);
        toast.error("Không thể tải danh sách chi nhánh");
      } finally {
        setLoadingBranches(false);
      }
    };
    loadBranches();
  }, []);

  // Poll order status
  const pollOrderStatus = useCallback(async () => {
    if (!orderId) return;

    try {
      const detail = await orderService.getOrderDetail(orderId);
      setOrderDetail(detail);

      // Stop polling if order is READY or PAID
      if (detail.status === "READY" || detail.status === "PAID") {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error polling order status:", error);
    }
  }, [orderId]);

  // Start polling when orderId is set
  useEffect(() => {
    if (orderId && currentStep === "order-status") {
      // Initial fetch
      pollOrderStatus();

      // Start polling every 20 seconds
      pollingIntervalRef.current = setInterval(pollOrderStatus, 20000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [orderId, currentStep, pollOrderStatus]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle branch selection
  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setTableNumber(""); // Reset table number when switching branch
  };

  // Handle continue to customer info
  const handleContinueToCustomerInfo = async () => {
    if (!selectedBranch) {
      toast.error("Vui lòng chọn chi nhánh");
      return;
    }
    if (!tableNumber) {
      toast.error("Vui lòng nhập số bàn");
      return;
    }

    try {
      setCheckingTable(true);
      const result = await tableService.checkTableAvailability(
        parseInt(tableNumber),
        String(selectedBranch.id)
      );

      if (result.isAvailable) {
        toast.success(result.message || "Bàn hợp lệ");
        setCurrentStep("customer-info");
      } else {
        toast.error(result.message || "Bàn không hợp lệ. Vui lòng chọn bàn khác.");
      }
    } catch (error: any) {
      console.error("Error checking table:", error);
      toast.error(error.message || "Không thể kiểm tra bàn");
    } finally {
      setCheckingTable(false);
    }
  };

  // Handle customer login
  const handleCustomerLogin = async () => {
    if (!customerPhone || !customerName) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!selectedBranch) {
      toast.error("Vui lòng chọn chi nhánh");
      return;
    }

    try {
      setLoggingIn(true);
      const response = await authService.customerLogin({
        phone: customerPhone,
        fullName: customerName,
        branchId: String(selectedBranch.id),
        tableNumber: parseInt(tableNumber),
      });

      void response;
      toast.success("Đăng nhập thành công!");

      // Load menu for branch
      setLoadingMenu(true);
      const menu = await menuService.getMenuItemsByBranch(String(selectedBranch.id));
      const availableMenu = menu.filter((item) => item.available);
      setMenuItems(availableMenu);
      
      // Fetch ratings for all menu items
      fetchDishRatings(availableMenu);
      
      setLoadingMenu(false);

      setCurrentStep("menu");
    } catch (error: any) {
      console.error("Error logging in customer:", error);
      toast.error(error.message || "Đăng nhập thất bại");
    } finally {
      setLoggingIn(false);
    }
  };

  // Add item to cart
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`Đã thêm ${item.name} vào giỏ hàng`);
  };

  // Update cart item quantity
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove item from cart
  // Handle create order
  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    if (!selectedBranch) {
      toast.error("Vui lòng chọn chi nhánh");
      return;
    }

    try {
      setCreatingOrder(true);

      const orderData = {
        branchId: String(selectedBranch.id),
        tableNumber: parseInt(tableNumber),
        infoOrders: cart.map((item) => ({
          branchDishId: item.id,
          quantity: item.quantity,
        })),
      };

      const result = await orderService.createCustomerOrder(orderData);

      // Verify total price matches
      if (Math.abs(result.totalPrice - cartTotal) > 1) {
        console.warn("Price mismatch:", {
          frontend: cartTotal,
          backend: result.totalPrice,
        });
        toast.warning("Có sự khác biệt về giá. Vui lòng kiểm tra lại đơn hàng.");
      }

      // Store menu items for order display
      const itemsMap = new Map<string, MenuItem>();
      cart.forEach((item) => itemsMap.set(item.id, item));
      setOrderMenuItems(itemsMap);

      setOrderId(result.orderId);
      setShowConfirmOrder(false);
      setCurrentStep("order-status");

      toast.success("Đặt món thành công!");
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Không thể tạo đơn hàng");
    } finally {
      setCreatingOrder(false);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!selectedPaymentMethod || !orderId) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      setProcessingPayment(true);

      const result = await paymentService.createCustomerPayment({
        orderId,
        paymentMethod: selectedPaymentMethod,
      });

      setPaymentResult(result);
      setCurrentStep("complete");
      toast.success("Thanh toán thành công!");
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Thanh toán thất bại");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Reset everything and go back to start
  const handleReset = () => {
    setCurrentStep("select-branch");
    setSelectedBranch(null);
    setTableNumber("");
    setCustomerPhone("");
    setCustomerName("");
    setMenuItems([]);
    setSelectedCategory("all");
    setCart([]);
    setOrderId(null);
    setOrderDetail(null);
    setOrderMenuItems(new Map());
    setSelectedPaymentMethod(null);
    setPaymentResult(null);
    setSelectedDish(null);
    setShowDishDetail(false);
    setDishRatings(new Map());

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Go back one step
  const handleBack = () => {
    switch (currentStep) {
      case "customer-info":
        setCurrentStep("select-branch");
        break;
      case "menu":
        setCurrentStep("customer-info");
        break;
      default:
        break;
    }
  };

  // Render branch + table step as a single form
  const renderBranchSelection = () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-lg">
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Coffee className="h-9 w-9" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold leading-tight text-foreground">EATNOW</h1>
                <p className="text-sm text-muted-foreground">
                  Chọn chi nhánh, nhập số bàn và tiếp tục
                </p>
              </div>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Bắt đầu đặt món</CardTitle>
              <p className="text-sm text-muted-foreground">
                Bạn chỉ cần chọn chi nhánh và số bàn
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Chi nhánh</Label>
                <Popover open={branchPickerOpen} onOpenChange={setBranchPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={branchPickerOpen}
                      disabled={loadingBranches}
                      className="w-full justify-between h-12"
                    >
                      <span className="truncate">
                        {loadingBranches
                          ? "Đang tải chi nhánh..."
                          : selectedBranch
                            ? selectedBranch.name
                            : "Chọn chi nhánh"}
                      </span>
                      {loadingBranches ? (
                        <Loader2 className="h-4 w-4 animate-spin opacity-70" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 opacity-70" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-[--radix-popover-trigger-width] p-0"
                  >
                    <Command>
                      <CommandInput placeholder="Tìm chi nhánh..." />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy chi nhánh.</CommandEmpty>
                        <CommandGroup heading="Danh sách chi nhánh">
                          {branches.map((branch) => (
                            <CommandItem
                              key={branch.id}
                              value={branch.name}
                              onSelect={() => {
                                handleSelectBranch(branch);
                                setBranchPickerOpen(false);
                              }}
                            >
                              <Check
                                className={`h-4 w-4 ${
                                  selectedBranch?.id === branch.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <span className="truncate">{branch.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tableNumber" className="text-sm font-medium">
                  Số bàn
                </Label>
                <Input
                  id="tableNumber"
                  type="number"
                  placeholder="1, 2, 3..."
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="h-12 text-center text-xl font-bold"
                  min={1}
                  disabled={!selectedBranch}
                />
                <p className="text-xs text-muted-foreground min-h-[1.25rem]">
                  {!selectedBranch
                    ? "Vui lòng chọn chi nhánh trước để nhập số bàn"
                    : "1, 2, 3..."}
                </p>
              </div>

              <Button
                className="w-full h-12 text-base font-semibold rounded-xl shadow-md hover:shadow-lg"
                onClick={handleContinueToCustomerInfo}
                disabled={checkingTable || !selectedBranch || !tableNumber}
              >
                {checkingTable ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    Tiếp tục
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="bg-card border rounded-xl p-3">
              <Check className="h-5 w-5 mx-auto text-green-600" />
              <p className="text-xs mt-2 text-muted-foreground">Dễ đặt món</p>
            </div>
            <div className="bg-card border rounded-xl p-3">
              <Clock className="h-5 w-5 mx-auto text-amber-500" />
              <p className="text-xs mt-2 text-muted-foreground">Cập nhật nhanh</p>
            </div>
            <div className="bg-card border rounded-xl p-3">
              <CreditCard className="h-5 w-5 mx-auto text-primary" />
              <p className="text-xs mt-2 text-muted-foreground">Thanh toán tiện</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render customer info step
  const renderCustomerInfo = () => (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header Section */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-6 relative shadow-lg mb-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="absolute left-4 top-4 text-primary-foreground hover:bg-primary/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center pt-4">
            <div className="w-16 h-16 bg-background/95 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Thông tin khách hàng</h1>
            <div className="inline-flex items-center gap-2 bg-background/95 text-primary rounded-full px-4 py-2 text-sm">
              <Store className="h-4 w-4" />
              <span>{selectedBranch?.name}</span>
              <span className="mx-1">•</span>
              <span>Bàn {tableNumber}</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-card rounded-2xl shadow-lg p-6 space-y-5">
          {/* Phone Input */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              Số điện thoại
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="Nhập số điện thoại (VD: 0369852147)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="h-12 text-base rounded-xl px-4"
            />
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              Họ và tên
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Nhập họ và tên (VD: Nguyễn Văn A)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-12 text-base rounded-xl px-4"
            />
          </div>

          {/* Submit Button */}
          <Button
            className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg mt-4"
            onClick={handleCustomerLogin}
            disabled={loggingIn || !customerPhone || !customerName}
          >
            {loggingIn ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <UtensilsCrossed className="h-5 w-5 mr-2" />
                Bắt đầu đặt món
              </>
            )}
          </Button>

          {/* Info note */}
          <p className="text-center text-xs text-gray-400 pt-2">
            🔒 Thông tin của bạn được bảo mật
          </p>
        </div>
      </div>
    </div>
  );

  // Render menu step
  const renderMenu = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Sticky Top Bar with Header + Categories */}
      <div className="sticky top-0 z-50 isolate shadow-sm">
        {/* Header Section - Brown */}
        <div className="bg-primary text-primary-foreground border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate">{selectedBranch?.name}</h1>
                <p className="text-sm text-primary-foreground/80 truncate">
                  Bàn {tableNumber} • {customerName}
                </p>
              </div>
              <Button
                variant="ghost"
                className="relative h-10 w-10 p-0 rounded-full text-primary-foreground hover:bg-primary/20"
                onClick={() => cart.length > 0 && setShowConfirmOrder(true)}
                aria-label="Mở giỏ hàng"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-white text-primary">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Categories Section - White */}
        <div className="bg-background border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="h-10 w-24 rounded-full px-0 whitespace-nowrap flex-none font-medium"
                >
                  {category === "all" ? "Tất cả" : category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Menu Section */}
          <div className="flex-1">
            {/* Menu Items */}
            {loadingMenu ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <p className="text-muted-foreground text-lg">Không có món trong danh mục này</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
                {filteredMenuItems.map((item) => {
                  const rating = dishRatings.get(item.id) || 0;
                  return (
                    <Card
                      key={item.id}
                      className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedDish(item);
                        setShowDishDetail(true);
                      }}
                    >
                      {/* Fixed aspect ratio image container */}
                      <div className="aspect-square overflow-hidden relative bg-gray-100">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        {(item.bestSeller || item.isNew) && (
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {item.bestSeller && (
                              <Badge className="bg-amber-500">Best Seller</Badge>
                            )}
                            {item.isNew && (
                              <Badge className="bg-green-500">Mới</Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 md:p-4">
                        <h4 className="font-semibold text-sm md:text-base leading-snug line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-500 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-primary font-bold text-sm md:text-base">
                              {formatPrice(item.price)}
                            </span>
                            {/* Rating display */}
                            <div className="flex items-center gap-1">
                              {rating > 0 ? (
                                <>
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium text-gray-600">
                                    {rating}
                                  </span>
                                </>
                              ) : (
                                <Star className="h-3 w-3 text-gray-300" />
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="h-9 w-9 p-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="hidden lg:block w-80">
            <Card className="sticky top-28">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Đơn hàng ({cartItemCount} món)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có món nào trong giỏ</p>
                ) : (
                  <>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 pb-3 border-b">
                            <ImageWithFallback
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                              <p className="text-primary text-sm">
                                {formatPrice(item.price)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleUpdateQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleUpdateQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng</span>
                        <span className="text-primary">{formatPrice(cartTotal)}</span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => setShowConfirmOrder(true)}
                      >
                        Xác nhận đặt món
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Order Dialog */}
      <Dialog open={showConfirmOrder} onOpenChange={setShowConfirmOrder}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận đơn hàng</DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra lại đơn hàng trước khi xác nhận
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-64">
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-gray-500 text-xs">x{item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Tổng cộng</span>
            <span className="text-primary">{formatPrice(cartTotal)}</span>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmOrder(false)}>
              Quay lại
            </Button>
            <Button
              className=""
              onClick={handleCreateOrder}
              disabled={creatingOrder}
            >
              {creatingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận đặt món"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dish Detail Dialog */}
      <DishDetailDialog
        open={showDishDetail}
        onOpenChange={setShowDishDetail}
        item={selectedDish}
        branchDishId={selectedDish?.id}
      />
    </div>
  );

  // Render order status step
  const renderOrderStatus = () => {
    const status = orderDetail?.status || "CONFIRMED";
    const statusInfo = ORDER_STATUS_MAP[status] || ORDER_STATUS_MAP.CONFIRMED;
    const isReady = status === "READY";

    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Theo dõi đơn hàng</h1>
            <p className="text-gray-600">
              {selectedBranch?.name} • Bàn {tableNumber}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chi tiết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {orderDetail?.orderItemInfos?.map((item) => {
                      const menuItem = orderMenuItems.get(item.branchDishId);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b"
                        >
                          <div className="flex items-center gap-3">
                            {menuItem && (
                              <ImageWithFallback
                                src={menuItem.image}
                                alt={menuItem.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {menuItem?.name || "Món ăn"}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {formatPrice(item.unitPrice)} x {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-primary">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="flex justify-between text-xl font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {formatPrice(orderDetail?.totalPrice || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trạng thái đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Status Badge */}
                <div className="flex flex-col items-center py-8">
                  <div
                    className={`w-20 h-20 rounded-full ${statusInfo.color} flex items-center justify-center text-white mb-4`}
                  >
                    {statusInfo.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{statusInfo.label}</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Mã đơn: {orderId?.slice(0, 8).toUpperCase()}
                  </p>
                </div>

                {/* Status Timeline */}
                <div className="space-y-4 mt-4">
                  {Object.entries(ORDER_STATUS_MAP).slice(0, 3).map(([key, value], index) => {
                    const isPast =
                      Object.keys(ORDER_STATUS_MAP).indexOf(status) >= index;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isPast ? value.color : "bg-gray-200"
                          } text-white text-sm`}
                        >
                          {isPast ? <Check className="h-4 w-4" /> : index + 1}
                        </div>
                        <span
                          className={`font-medium ${
                            isPast ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {value.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Refresh indicator */}
                <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-sm">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Tự động cập nhật mỗi 20 giây
                </div>

                {/* Payment Button */}
                {isReady && (
                  <Button
                    className="w-full mt-6 h-12 bg-green-500 hover:bg-green-600 text-lg"
                    onClick={() => setCurrentStep("payment")}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Thanh toán
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // Render payment step
  const renderPayment = () => (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            className="absolute left-4 top-4"
            onClick={() => setCurrentStep("order-status")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-2xl">Thanh toán</CardTitle>
          <p className="text-gray-600 mt-2">
            Tổng tiền:{" "}
            <span className="font-bold text-primary text-xl">
              {formatPrice(orderDetail?.totalPrice || 0)}
            </span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base">Chọn phương thức thanh toán</Label>
            {PAYMENT_METHODS.map((method) => (
              <Card
                key={method.id}
                className={`cursor-pointer transition-all ${
                  selectedPaymentMethod === method.id
                    ? "border-2 border-primary bg-primary/10"
                    : "hover:border-gray-300"
                }`}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div
                    className={`p-3 rounded-full ${
                      selectedPaymentMethod === method.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {method.icon}
                  </div>
                  <span className="font-medium text-lg">{method.label}</span>
                  {selectedPaymentMethod === method.id && (
                    <Check className="h-5 w-5 text-primary ml-auto" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            className="w-full h-14 text-lg bg-green-500 hover:bg-green-600"
            onClick={handlePayment}
            disabled={processingPayment || !selectedPaymentMethod}
          >
            {processingPayment ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Xác nhận thanh toán
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Render complete step
  const renderComplete = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 text-center">
        <CardContent className="py-12">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thanh toán thành công!</h2>

          <div className="space-y-2 text-gray-600 mb-8">
            <p>
              Số tiền: <span className="font-bold text-green-600">{formatPrice(paymentResult?.amount || 0)}</span>
            </p>
            <p>
              Phương thức: <span className="font-medium">{paymentResult?.paymentMethod}</span>
            </p>
            <p className="text-sm">Mã giao dịch: {paymentResult?.id?.slice(0, 8).toUpperCase()}</p>
          </div>

          <p className="text-gray-500 mb-8">
            Cảm ơn quý khách đã sử dụng dịch vụ của EATNOW!
          </p>

          <Button
            className="w-full h-14 text-lg"
            onClick={handleReset}
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Đặt món mới
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Main render
  return (
    <>
      {currentStep === "select-branch" && renderBranchSelection()}
      {currentStep === "customer-info" && renderCustomerInfo()}
      {currentStep === "menu" && renderMenu()}
      {currentStep === "order-status" && renderOrderStatus()}
      {currentStep === "payment" && renderPayment()}
      {currentStep === "complete" && renderComplete()}
    </>
  );
}
