import { useState, useEffect } from 'react';
import { Building2, MapPin, Clock, Star, Plus, Pencil, Search, Loader2, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { branches as mockBranches } from '../../data/mockData';
import { Branch } from '../../types';
import { branchService } from '../../services/branch';
import { toast } from 'sonner';

// Interface cho form data thêm chi nhánh
interface AddBranchFormData {
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  openTime: string;
  closeTime: string;
}

// Interface cho form data chỉnh sửa chi nhánh
interface EditBranchFormData {
  id: string;
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  status: string;
  openTime: string;
  closeTime: string;
}

export function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data cho thêm chi nhánh
  const [addFormData, setAddFormData] = useState<AddBranchFormData>({
    name: '',
    address: '',
    phone: '',
    imageUrl: '',
    openTime: '10:00',
    closeTime: '22:00'
  });

  // Form data cho chỉnh sửa chi nhánh
  const [editFormData, setEditFormData] = useState<EditBranchFormData>({
    id: '',
    name: '',
    address: '',
    phone: '',
    imageUrl: '',
    status: 'ACTIVE',
    openTime: '10:00',
    closeTime: '22:00'
  });

  // Fetch branches từ API khi component mount
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const data = await branchService.getAllBranches();
      setBranches(data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Không thể tải danh sách chi nhánh');
      // Fallback to mock data
      setBranches(mockBranches);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBranch = async () => {
    if (!addFormData.name || !addFormData.address || !addFormData.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      await branchService.createBranch({
        name: addFormData.name,
        address: addFormData.address,
        phone: addFormData.phone,
        imageUrl: addFormData.imageUrl || 'https://images.unsplash.com/photo-1669131196140-49591336b13e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
        openTime: addFormData.openTime + ':00',
        closeTime: addFormData.closeTime + ':00'
      });
      
      toast.success('Thêm chi nhánh thành công!');
      setIsAddDialogOpen(false);
      
      // Reset form
      setAddFormData({
        name: '',
        address: '',
        phone: '',
        imageUrl: '',
        openTime: '10:00',
        closeTime: '22:00'
      });
      
      // Refresh danh sách
      fetchBranches();
    } catch (error: any) {
      toast.error(error.message || 'Không thể thêm chi nhánh');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBranch = async () => {
    if (!editFormData.name || !editFormData.address || !editFormData.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSubmitting(true);
      await branchService.updateBranch({
        id: editFormData.id,
        name: editFormData.name,
        address: editFormData.address,
        phone: editFormData.phone,
        imageUrl: editFormData.imageUrl,
        status: editFormData.status,
        openTime: editFormData.openTime.length === 5 ? editFormData.openTime + ':00' : editFormData.openTime,
        closeTime: editFormData.closeTime.length === 5 ? editFormData.closeTime + ':00' : editFormData.closeTime
      });
      
      toast.success('Cập nhật chi nhánh thành công!');
      setIsEditDialogOpen(false);
      
      // Refresh danh sách
      fetchBranches();
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật chi nhánh');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (branch: Branch) => {
    // Format time từ "10:00:00" sang "10:00"
    const formatTimeForInput = (time: string | undefined) => {
      if (!time) return '10:00';
      const parts = time.split(':');
      return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
    };

    setEditFormData({
      id: branch.id,
      name: branch.name,
      address: branch.address,
      phone: branch.phone || '',
      imageUrl: branch.image || branch.image_url || '',
      status: branch.status || 'ACTIVE',
      openTime: formatTimeForInput(branch.open_time),
      closeTime: formatTimeForInput(branch.close_time)
    });
    setIsEditDialogOpen(true);
  };

  const activeBranches = branches.filter(b => b.status === 'ACTIVE' || !b.status).length;

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
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Địa chỉ *</Label>
                <Input
                  id="address"
                  placeholder="VD: 123 Nguyễn Huệ, Quận 1, Hồ Chí Minh"
                  value={addFormData.address}
                  onChange={(e) => setAddFormData({ ...addFormData, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  placeholder="VD: 0123456789"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="openTime">Giờ mở cửa *</Label>
                  <Input
                    id="openTime"
                    type="time"
                    value={addFormData.openTime}
                    onChange={(e) => setAddFormData({ ...addFormData, openTime: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="closeTime">Giờ đóng cửa *</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    value={addFormData.closeTime}
                    onChange={(e) => setAddFormData({ ...addFormData, closeTime: e.target.value })}
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
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button onClick={handleAddBranch} className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  'Thêm chi nhánh'
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
                <p className="text-sm text-muted-foreground">Chi nhánh hoạt động</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{activeBranches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chi nhánh ngừng hoạt động</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{branches.length - activeBranches}</p>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Đang tải danh sách chi nhánh...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chi nhánh</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Giờ mở cửa</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {branch.phone || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {branch.hours}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {branch.status === 'INACTIVE' ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                          Ngừng hoạt động
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Hoạt động
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(branch)}
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
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Địa chỉ *</Label>
              <Input
                id="edit-address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Số điện thoại *</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-openTime">Giờ mở cửa *</Label>
                <Input
                  id="edit-openTime"
                  type="time"
                  value={editFormData.openTime}
                  onChange={(e) => setEditFormData({ ...editFormData, openTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-closeTime">Giờ đóng cửa *</Label>
                <Input
                  id="edit-closeTime"
                  type="time"
                  value={editFormData.closeTime}
                  onChange={(e) => setEditFormData({ ...editFormData, closeTime: e.target.value })}
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
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Trạng thái chi nhánh</Label>
                <p className="text-sm text-muted-foreground">
                  {editFormData.status === 'ACTIVE' ? 'Chi nhánh đang hoạt động' : 'Chi nhánh đã ngừng hoạt động'}
                </p>
              </div>
              <Switch
                checked={editFormData.status === 'ACTIVE'}
                onCheckedChange={(checked) => 
                  setEditFormData({ ...editFormData, status: checked ? 'ACTIVE' : 'INACTIVE' })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleEditBranch} className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
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
