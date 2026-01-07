import { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Pencil, Search, Loader2, Star, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { MenuItem } from '../../types';
import { menuService } from '../../services/menu';
import { toast } from 'sonner';

// Interface cho form data thêm món
interface AddDishFormData {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  isBestSeller: boolean;
  isNew: boolean;
  isActive: boolean;
}

// Interface cho form data chỉnh sửa món
interface EditDishFormData {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  isBestSeller: boolean;
  isNew: boolean;
  isActive: boolean;
}

// Danh sách categories
const CATEGORIES = [
  'Khai vị',
  'Món chính',
  'Tráng miệng',
  'Đồ uống',
  'Món đặc biệt'
];

export function SystemMenuManagement() {
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data cho thêm món
  const [addFormData, setAddFormData] = useState<AddDishFormData>({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    price: 0,
    isBestSeller: false,
    isNew: false,
    isActive: true
  });

  // Form data cho chỉnh sửa món
  const [editFormData, setEditFormData] = useState<EditDishFormData>({
    id: '',
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    price: 0,
    isBestSeller: false,
    isNew: false,
    isActive: true
  });

  // Fetch dishes từ API khi component mount
  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      setIsLoading(true);
      const data = await menuService.getAllMenuItems();
      setDishes(data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      toast.error('Không thể tải danh sách món ăn');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0
    }).format(price) + ' ₫';
  };

  const handleAddDish = async () => {
    if (!addFormData.name || !addFormData.category || addFormData.price <= 0) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      await menuService.createDish({
        name: addFormData.name,
        description: addFormData.description,
        category: addFormData.category,
        imageUrl: addFormData.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        price: addFormData.price,
        isBestSeller: addFormData.isBestSeller,
        isNew: addFormData.isNew,
        isActive: addFormData.isActive
      });

      toast.success('Thêm món ăn thành công!');
      setIsAddDialogOpen(false);

      // Reset form
      setAddFormData({
        name: '',
        description: '',
        category: '',
        imageUrl: '',
        price: 0,
        isBestSeller: false,
        isNew: false,
        isActive: true
      });

      // Refresh danh sách
      fetchDishes();
    } catch (error: any) {
      toast.error(error.message || 'Không thể thêm món ăn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDish = async () => {
    if (!editFormData.name || !editFormData.category || editFormData.price <= 0) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      await menuService.updateDish({
        id: editFormData.id,
        name: editFormData.name,
        description: editFormData.description,
        category: editFormData.category,
        imageUrl: editFormData.imageUrl,
        price: editFormData.price,
        isBestSeller: editFormData.isBestSeller,
        isNew: editFormData.isNew,
        isActive: editFormData.isActive
      });

      toast.success('Cập nhật món ăn thành công!');
      setIsEditDialogOpen(false);

      // Refresh danh sách
      fetchDishes();
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật món ăn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (dish: MenuItem) => {
    setEditFormData({
      id: dish.id,
      name: dish.name,
      description: dish.description || '',
      category: dish.category || '',
      imageUrl: dish.image || '',
      price: dish.price,
      isBestSeller: dish.bestSeller || false,
      isNew: dish.isNew || false,
      isActive: dish.available !== false
    });
    setIsEditDialogOpen(true);
  };

  const activeDishes = dishes.filter(d => d.available !== false).length;
  const bestSellerCount = dishes.filter(d => d.bestSeller).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '24px' }}>Quản lý Menu hệ thống</h2>
          <p className="text-muted-foreground">Quản lý tất cả món ăn trong hệ thống EATNOW</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Thêm món
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm món ăn mới</DialogTitle>
              <DialogDescription>
                Điền thông tin món ăn mới vào form bên dưới
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên món *</Label>
                <Input
                  id="name"
                  placeholder="VD: Phở bò đặc biệt"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về món ăn..."
                  value={addFormData.description}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Danh mục *</Label>
                  <Select
                    value={addFormData.category}
                    onValueChange={(value) => setAddFormData({ ...addFormData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Giá (VNĐ) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="VD: 50000"
                    value={addFormData.price || ''}
                    onChange={(e) => setAddFormData({ ...addFormData, price: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">URL hình ảnh</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://..."
                  value={addFormData.imageUrl}
                  onChange={(e) => setAddFormData({ ...addFormData, imageUrl: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="isBestSeller">Best Seller</Label>
                  <Switch
                    id="isBestSeller"
                    checked={addFormData.isBestSeller}
                    onCheckedChange={(checked) => setAddFormData({ ...addFormData, isBestSeller: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="isNew">Món mới</Label>
                  <Switch
                    id="isNew"
                    checked={addFormData.isNew}
                    onCheckedChange={(checked) => setAddFormData({ ...addFormData, isNew: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="isActive">Hoạt động</Label>
                  <Switch
                    id="isActive"
                    checked={addFormData.isActive}
                    onCheckedChange={(checked) => setAddFormData({ ...addFormData, isActive: checked })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button onClick={handleAddDish} className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  'Thêm món'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng số món</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{dishes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Món đang hoạt động</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{activeDishes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Seller</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{bestSellerCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách món ăn</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm món ăn..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Đang tải danh sách món ăn...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Món ăn</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead className="text-center">Best Seller</TableHead>
                  <TableHead className="text-center">Món mới</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDishes.map((dish) => (
                  <TableRow key={dish.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {dish.image && (
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{dish.name}</div>
                          {dish.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {dish.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{dish.category || 'Chưa phân loại'}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(dish.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      {dish.bestSeller ? (
                        <Badge className="bg-amber-100 text-amber-800">
                          <Star className="h-3 w-3 mr-1" />
                          Best
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {dish.isNew ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Mới
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {dish.available !== false ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Hoạt động
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                          Ngừng bán
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(dish)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa món ăn</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin món ăn
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên món *</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Danh mục *</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Giá (VNĐ) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  value={editFormData.price || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, price: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-imageUrl">URL hình ảnh</Label>
              <Input
                id="edit-imageUrl"
                value={editFormData.imageUrl}
                onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="edit-isBestSeller">Best Seller</Label>
                <Switch
                  id="edit-isBestSeller"
                  checked={editFormData.isBestSeller}
                  onCheckedChange={(checked) => setEditFormData({ ...editFormData, isBestSeller: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="edit-isNew">Món mới</Label>
                <Switch
                  id="edit-isNew"
                  checked={editFormData.isNew}
                  onCheckedChange={(checked) => setEditFormData({ ...editFormData, isNew: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="edit-isActive">Hoạt động</Label>
                <Switch
                  id="edit-isActive"
                  checked={editFormData.isActive}
                  onCheckedChange={(checked) => setEditFormData({ ...editFormData, isActive: checked })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleEditDish} className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
