import { useState, useEffect } from "react";
import { Pencil, Search, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { MenuItem } from "../../types";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { menuService } from "../../services";

interface MenuManagementProps {
  onBack?: () => void;
  branchId?: string; // Optional: từ props
}

// Extended MenuItem với thông tin branch
interface BranchMenuItem extends MenuItem {
  dishId?: string; // ID của dish (từ menu super admin)
  branchDishId?: string; // ID của branch_dish record
  originalPrice?: number; // Giá gốc từ menu super admin
  branchPrice?: number; // Giá chi nhánh
  isInBranch: boolean; // Món có trong menu chi nhánh hay không
}

export function MenuManagement({
  onBack,
  branchId: propBranchId,
}: MenuManagementProps) {
  // Nếu branchId được truyền từ props, sử dụng nó
  // Nếu không, cố gắng lấy từ localStorage hoặc context
  const getInitialBranchId = () => {
    if (propBranchId) return propBranchId;

    // Thử lấy từ localStorage
    try {
      const stored = localStorage.getItem("eatnow_auth");
      if (stored) {
        const data = JSON.parse(stored);
        return data.user?.branchId;
      }
    } catch (e) {
      // Ignore parse errors
    }

    return undefined;
  };

  const branchId = getInitialBranchId();

  const [menuItems, setMenuItems] = useState<BranchMenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<BranchMenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    branchPrice: "",
    isActive: false,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  // Load menu data
  useEffect(() => {
    loadMenuData();
  }, [branchId]);

  const loadMenuData = async () => {
    if (!branchId) {
      toast.error("Không tìm thấy thông tin chi nhánh");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Lấy tất cả món active từ menu super admin
      const activeDishes = await menuService.getActiveDishes();

      // 2. Lấy menu của chi nhánh
      const branchDishes = await menuService.getMenuItemsByBranch(branchId);

      // 3. Tạo map từ dishId -> branch dish info
      const branchDishMap = new Map<string, MenuItem>();
      branchDishes.forEach((dish) => {
        if (dish.dishId) {
          branchDishMap.set(dish.dishId, dish);
        }
      });

      // 4. Combine data: tất cả món từ super admin + thông tin từ branch
      const combinedItems: BranchMenuItem[] = activeDishes.map((dish) => {
        const branchDish = branchDishMap.get(dish.id);
        const isInBranch = !!branchDish;

        return {
          ...dish,
          dishId: dish.id, // ID món từ menu super admin
          branchDishId: branchDish?.id, // ID của branch_dish record (nếu có)
          originalPrice: dish.price, // Giá gốc
          branchPrice: branchDish?.price, // Giá chi nhánh (nếu có)
          price: branchDish?.price ?? dish.price, // Hiển thị giá chi nhánh nếu có
          isInBranch,
          available: branchDish?.available ?? false, // Chỉ available nếu có trong branch
        };
      });

      // Sort: theo trạng thái (món đang bán lên trên), trong mỗi trạng thái sort theo danh mục, rồi theo tên
      combinedItems.sort((a, b) => {
        // 1. Sort theo trạng thái: món trong chi nhánh (đang bán) lên trên
        if (a.isInBranch !== b.isInBranch) {
          return a.isInBranch ? -1 : 1;
        }
        // 2. Trong cùng trạng thái, sort theo danh mục
        const categoryCompare = a.category.localeCompare(b.category, "vi");
        if (categoryCompare !== 0) {
          return categoryCompare;
        }
        // 3. Trong cùng danh mục, sort theo tên
        return a.name.localeCompare(b.name, "vi");
      });

      setMenuItems(combinedItems);
    } catch (error) {
      console.error("Error loading menu data:", error);
      toast.error("Không thể tải dữ liệu menu");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: BranchMenuItem) => {
    setEditingItem(item);
    setFormData({
      branchPrice:
        item.branchPrice?.toString() || item.originalPrice?.toString() || "",
      isActive: item.isInBranch,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem || !branchId) return;

    const price = parseFloat(formData.branchPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Vui lòng nhập giá hợp lệ");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem.isInBranch && editingItem.branchDishId) {
        // Cập nhật món đã có trong chi nhánh
        await menuService.updateBranchDish(editingItem.branchDishId, {
          price: price,
          isAvailable: formData.isActive,
        });
        toast.success("Đã cập nhật món thành công");
      } else if (formData.isActive && editingItem.dishId) {
        // Thêm món mới vào chi nhánh
        await menuService.addDishToBranch(branchId, editingItem.dishId, price);
        toast.success("Đã thêm món vào menu chi nhánh");
      } else {
        // Món không active và chưa có trong chi nhánh -> không làm gì
        toast.info("Không có thay đổi nào được lưu");
      }

      // Reload data
      await loadMenuData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Không thể lưu thay đổi");
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Món chính": "bg-amber-100 text-amber-800",
      "Khai vị": "bg-green-100 text-green-800",
      "Tráng miệng": "bg-pink-100 text-pink-800",
      "Đồ uống": "bg-blue-100 text-blue-800",
      "Món đặc biệt": "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (!branchId) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Không tìm thấy thông tin chi nhánh
          </p>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontSize: "28px" }}>Quản lý thực đơn chi nhánh</h1>
            <p className="text-muted-foreground">
              Quản lý menu của chi nhánh (
              {menuItems.filter((i) => i.isInBranch).length} món đang bán /{" "}
              {menuItems.length} món)
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Đang tải...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Hình</TableHead>
                    <TableHead>Tên món</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-right">Giá gốc</TableHead>
                    <TableHead className="text-right">Giá chi nhánh</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={!item.isInBranch ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <div className="w-14 h-14 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div className="text-sm text-muted-foreground" title={item.description}>
                            {item.description && item.description.length > 50
                              ? `${item.description.substring(0, 50)}...`
                              : item.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-muted-foreground">
                          {formatPrice(item.originalPrice || 0)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div style={{ fontWeight: 600 }}>
                          {item.isInBranch
                            ? formatPrice(item.branchPrice || 0)
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={item.isInBranch ? "default" : "secondary"}
                          className={
                            item.isInBranch ? "bg-green-100 text-green-800" : ""
                          }
                        >
                          {item.isInBranch ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!isLoading && filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Không tìm thấy món nào</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa món - {editingItem?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Preview Image */}
              {editingItem?.image && (
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border">
                    <ImageWithFallback
                      src={editingItem.image}
                      alt={editingItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Original Price (Read only) */}
              <div className="space-y-2">
                <Label>Giá gốc (từ menu hệ thống)</Label>
                <div className="p-3 bg-muted rounded-lg text-muted-foreground">
                  {formatPrice(editingItem?.originalPrice || 0)}
                </div>
              </div>

              {/* Branch Price */}
              <div className="space-y-2">
                <Label htmlFor="branchPrice">Giá chi nhánh (₫) *</Label>
                <Input
                  id="branchPrice"
                  type="number"
                  placeholder="Nhập giá cho chi nhánh"
                  value={formData.branchPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, branchPrice: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Giá này sẽ được hiển thị cho khách hàng khi đặt món tại chi
                  nhánh
                </p>
              </div>

              {/* Active/Inactive Toggle */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="isActive">Trạng thái</Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.isActive
                      ? "Món đang bán tại chi nhánh"
                      : "Món không có trong menu chi nhánh"}
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                  disabled={editingItem?.isInBranch && !formData.isActive}
                />
              </div>

              {!editingItem?.isInBranch && formData.isActive && (
                <div className="p-3 bg-green-50 text-green-800 rounded-lg text-sm">
                  ✓ Món này sẽ được thêm vào menu chi nhánh
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
