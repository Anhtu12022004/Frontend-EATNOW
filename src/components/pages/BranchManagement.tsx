import { useState } from 'react';
import { Building2, MapPin, Clock, Star, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { branches as initialBranches } from '../../data/mockData';
import { Branch } from '../../types';
import { toast } from 'sonner';

export function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    address: '',
    district: '',
    hours: '10:00 - 22:00',
    rating: 5.0,
    image: '',
    distance: 0
  });

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBranch = () => {
    if (!formData.name || !formData.address || !formData.district) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const newBranch: Branch = {
      id: `${branches.length + 1}`,
      name: formData.name,
      address: formData.address,
      district: formData.district,
      hours: formData.hours || '10:00 - 22:00',
      rating: formData.rating || 5.0,
      image: formData.image || 'https://images.unsplash.com/photo-1669131196140-49591336b13e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBtb2Rlcm58ZW58MXx8fHwxNzYwMzczOTI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      distance: formData.distance || 0
    };

    setBranches([...branches, newBranch]);
    setIsAddDialogOpen(false);
    setFormData({
      name: '',
      address: '',
      district: '',
      hours: '10:00 - 22:00',
      rating: 5.0,
      image: '',
      distance: 0
    });
    toast.success('Thêm chi nhánh thành công!');
  };

  const handleEditBranch = () => {
    if (!selectedBranch || !formData.name || !formData.address || !formData.district) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const updatedBranches = branches.map(branch =>
      branch.id === selectedBranch.id
        ? { ...branch, ...formData }
        : branch
    );

    setBranches(updatedBranches);
    setIsEditDialogOpen(false);
    setSelectedBranch(null);
    toast.success('Cập nhật chi nhánh thành công!');
  };

  const handleDeleteBranch = (branchId: string) => {
    if (confirm('Bạn có chắc muốn xóa chi nhánh này?')) {
      setBranches(branches.filter(branch => branch.id !== branchId));
      toast.success('Xóa chi nhánh thành công!');
    }
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      district: branch.district,
      hours: branch.hours,
      rating: branch.rating,
      image: branch.image,
      distance: branch.distance
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '24px' }}>Quản lý chi nhánh</h2>
          <p className="text-muted-foreground">Quản lý tất cả chi nhánh trong hệ thống</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Thêm chi nhánh
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm chi nhánh mới</DialogTitle>
              <DialogDescription>
                Điền thông tin chi nhánh mới vào form bên dưới
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên chi nhánh *</Label>
                <Input
                  id="name"
                  placeholder="VD: EATNOW - Nguyễn Huệ"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Địa chỉ *</Label>
                <Input
                  id="address"
                  placeholder="VD: 123 Nguyễn Huệ"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="district">Quận/Huyện *</Label>
                  <Input
                    id="district"
                    placeholder="VD: Quận 1"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hours">Giờ mở cửa</Label>
                  <Input
                    id="hours"
                    placeholder="VD: 10:00 - 22:00"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rating">Đánh giá</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="distance">Khoảng cách (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">URL hình ảnh</Label>
                <Input
                  id="image"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddBranch} className="bg-primary hover:bg-primary/90">
                Thêm chi nhánh
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
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng chi nhánh</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{branches.length}</p>
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
                <p className="text-sm text-muted-foreground">Đánh giá trung bình</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>
                  {(branches.reduce((acc, b) => acc + b.rating, 0) / branches.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chi nhánh hoạt động</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{branches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách chi nhánh</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm chi nhánh..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chi nhánh</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Quận/Huyện</TableHead>
                <TableHead>Giờ mở cửa</TableHead>
                <TableHead className="text-center">Đánh giá</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>
                    <div style={{ fontWeight: 600 }}>{branch.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {branch.address}
                    </div>
                  </TableCell>
                  <TableCell>{branch.district}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {branch.hours}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span>{branch.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      Hoạt động
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(branch)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBranch(branch.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chi nhánh</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi nhánh
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên chi nhánh *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Địa chỉ *</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-district">Quận/Huyện *</Label>
                <Input
                  id="edit-district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-hours">Giờ mở cửa</Label>
                <Input
                  id="edit-hours"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-rating">Đánh giá</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-distance">Khoảng cách (km)</Label>
                <Input
                  id="edit-distance"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">URL hình ảnh</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditBranch} className="bg-primary hover:bg-primary/90">
              Cập nhật
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
