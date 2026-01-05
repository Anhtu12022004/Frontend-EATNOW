import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { menuItems as initialMenuItems } from '../../data/mockData';
import { MenuItem } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

interface MenuManagementProps {
  onBack?: () => void;
}

export function MenuManagement({ onBack }: MenuManagementProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Món chính' as MenuItem['category'],
    image: '',
    available: true,
    bestSeller: false,
    isNew: false
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleAvailability = (itemId: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
    toast.success('Đã cập nhật trạng thái món');
  };

  const handleDelete = (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (confirm(`Bạn có chắc muốn xóa "${item?.name}"?`)) {
      setMenuItems(menuItems.filter(item => item.id !== itemId));
      toast.success('Đã xóa món thành công');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      available: item.available,
      bestSeller: item.bestSeller || false,
      isNew: item.isNew || false
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Món chính',
      image: '',
      available: true,
      bestSeller: false,
      isNew: false
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    // Validate
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên món');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }
    if (!formData.image.trim()) {
      toast.error('Vui lòng nhập URL hình ảnh');
      return;
    }

    const newItem: MenuItem = {
      id: editingItem?.id || 'm' + Date.now(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image,
      available: formData.available,
      bestSeller: formData.bestSeller,
      isNew: formData.isNew
    };

    if (editingItem?.id) {
      // Update existing
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id ? newItem : item
      ));
      toast.success('Đã cập nhật món thành công');
    } else {
      // Add new
      setMenuItems([...menuItems, newItem]);
      toast.success('Đã thêm món mới thành công');
    }

    setIsDialogOpen(false);
  };

  const getCategoryColor = (category: MenuItem['category']) => {
    const colors = {
      'Món chính': 'bg-amber-100 text-amber-800',
      'Khai vị': 'bg-green-100 text-green-800',
      'Tráng miệng': 'bg-pink-100 text-pink-800',
      'Đồ uống': 'bg-blue-100 text-blue-800',
      'Món đặc biệt': 'bg-purple-100 text-purple-800',
    };
    return colors[category];
  };

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
            <h1 style={{ fontSize: '28px' }}>Quản lý thực đơn</h1>
            <p className="text-muted-foreground">Thêm, sửa, xóa món trong menu ({menuItems.length} món)</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm món mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem?.id ? 'Chỉnh sửa món' : 'Thêm món mới'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên món *</Label>
                  <Input
                    id="name"
                    placeholder="Nhập tên món"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả *</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả ngắn gọn về món"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Giá (₫) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Danh mục *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value as MenuItem['category'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Món chính">Món chính</SelectItem>
                        <SelectItem value="Khai vị">Khai vị</SelectItem>
                        <SelectItem value="Tráng miệng">Tráng miệng</SelectItem>
                        <SelectItem value="Đồ uống">Đồ uống</SelectItem>
                        <SelectItem value="Món đặc biệt">Món đặc biệt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">URL hình ảnh *</Label>
                  <Input
                    id="image"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Có thể sử dụng URL từ Unsplash hoặc nguồn ảnh khác
                  </p>
                  {formData.image && (
                    <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden border">
                      <ImageWithFallback
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="available">Còn hàng</Label>
                      <p className="text-xs text-muted-foreground">
                        Món này có sẵn để đặt
                      </p>
                    </div>
                    <Switch 
                      id="available" 
                      checked={formData.available}
                      onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="bestseller">Best Seller</Label>
                      <p className="text-xs text-muted-foreground">
                        Hiển thị badge Best Seller
                      </p>
                    </div>
                    <Switch 
                      id="bestseller" 
                      checked={formData.bestSeller}
                      onCheckedChange={(checked) => setFormData({ ...formData, bestSeller: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="new">Món mới</Label>
                      <p className="text-xs text-muted-foreground">
                        Hiển thị badge New
                      </p>
                    </div>
                    <Switch 
                      id="new" 
                      checked={formData.isNew}
                      onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleSave}
                  >
                    {editingItem ? 'Cập nhật' : 'Thêm món'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Hình</TableHead>
                  <TableHead>Tên món</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Còn hàng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
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
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {item.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div style={{ fontWeight: 600 }}>
                        {formatPrice(item.price)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {item.bestSeller && (
                          <Badge variant="outline" className="text-xs">
                            Best
                          </Badge>
                        )}
                        {item.isNew && (
                          <Badge variant="outline" className="text-xs bg-green-50">
                            New
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAvailability(item.id)}
                      >
                        {item.available ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Không tìm thấy món nào
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
