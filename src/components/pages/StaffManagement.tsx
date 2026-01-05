import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ArrowLeft, UserX, UserCheck, KeyRound, Mail, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockStaff } from '../../data/mockData';
import { Staff } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

interface StaffManagementProps {
  onBack?: () => void;
}

export function StaffManagement({ onBack }: StaffManagementProps) {
  const [staffList, setStaffList] = useState<Staff[]>(mockStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'waiter' as Staff['role'],
    avatar: '',
    status: 'active' as Staff['status']
  });

  const filteredStaff = staffList.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.phone.includes(searchTerm)
  );

  const handleToggleStatus = (staffId: string) => {
    setStaffList(staffList.map(staff =>
      staff.id === staffId 
        ? { ...staff, status: staff.status === 'active' ? 'inactive' : 'active' } 
        : staff
    ));
    const staff = staffList.find(s => s.id === staffId);
    toast.success(`Đã ${staff?.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản`);
  };

  const handleDelete = (staff: Staff) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      setStaffList(staffList.filter(staff => staff.id !== staffToDelete.id));
      toast.success('Đã xóa nhân viên thành công');
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      avatar: staff.avatar || '',
      status: staff.status
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'waiter',
      avatar: '',
      status: 'active'
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    // Validate
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên nhân viên');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Vui lòng nhập email hợp lệ');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    const newStaff: Staff = {
      id: editingStaff?.id || 's' + Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      avatar: formData.avatar || undefined,
      status: formData.status,
      joinedDate: editingStaff?.joinedDate || new Date(),
      branchId: '1'
    };

    if (editingStaff?.id) {
      // Update existing
      setStaffList(staffList.map(staff => 
        staff.id === editingStaff.id ? newStaff : staff
      ));
      toast.success('Đã cập nhật thông tin nhân viên');
    } else {
      // Add new
      setStaffList([...staffList, newStaff]);
      toast.success('Đã thêm nhân viên mới thành công');
    }

    setIsDialogOpen(false);
  };

  const handleResetPassword = (staff: Staff) => {
    toast.success(`Đã gửi email đặt lại mật khẩu cho ${staff.name}`);
  };

  const getRoleBadge = (role: Staff['role']) => {
    const styles = {
      chef: 'bg-orange-100 text-orange-800',
      waiter: 'bg-blue-100 text-blue-800',
      cashier: 'bg-green-100 text-green-800',
      barista: 'bg-amber-100 text-amber-800',
      manager: 'bg-purple-100 text-purple-800',
    };

    const labels = {
      chef: 'Đầu bếp',
      waiter: 'Phục vụ',
      cashier: 'Thu ngân',
      barista: 'Pha chế',
      manager: 'Quản lý',
    };

    return <Badge className={styles[role]}>{labels[role]}</Badge>;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN').format(date);
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
            <h1 style={{ fontSize: '28px' }}>Quản lý nhân viên</h1>
            <p className="text-muted-foreground">
              Thêm, sửa, xóa nhân viên ({staffList.length} nhân viên)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm nhân viên
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên *</Label>
                  <Input
                    id="name"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@eatnow.vn"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      placeholder="0901234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Vai trò *</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => setFormData({ ...formData, role: value as Staff['role'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chef">Đầu bếp</SelectItem>
                        <SelectItem value="waiter">Phục vụ</SelectItem>
                        <SelectItem value="cashier">Thu ngân</SelectItem>
                        <SelectItem value="barista">Pha chế</SelectItem>
                        <SelectItem value="manager">Quản lý</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({ ...formData, status: value as Staff['status'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Đang làm việc</SelectItem>
                        <SelectItem value="inactive">Đã nghỉ việc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">URL ảnh đại diện (tùy chọn)</Label>
                  <Input
                    id="avatar"
                    placeholder="https://..."
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Nếu để trống, hệ thống sẽ hiển thị avatar mặc định
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleSave}
                  >
                    {editingStaff ? 'Cập nhật' : 'Thêm nhân viên'}
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

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Nhân viên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Ngày vào làm</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(staff.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 600 }}>{staff.name}</div>
                          <div className="text-sm text-muted-foreground">{staff.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(staff.role)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{staff.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{staff.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(staff.joinedDate)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {staff.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Đang làm
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Đã nghỉ</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(staff)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleStatus(staff.id)}
                        >
                          {staff.status === 'active' ? (
                            <UserX className="h-4 w-4 text-orange-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleResetPassword(staff)}
                        >
                          <KeyRound className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(staff)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredStaff.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Không tìm thấy nhân viên nào
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Tổng nhân viên</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>
                {staffList.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Đang làm việc</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }} className="text-green-600">
                {staffList.filter(s => s.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Đã nghỉ việc</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }} className="text-muted-foreground">
                {staffList.filter(s => s.status === 'inactive').length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên <strong>{staffToDelete?.name}</strong>? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
