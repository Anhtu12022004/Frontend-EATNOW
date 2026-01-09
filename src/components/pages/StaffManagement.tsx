import { useState, useEffect } from 'react';
import { Plus, Pencil, Search, ArrowLeft, UserX, UserCheck, KeyRound, Mail, Phone, Loader2, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { toast } from 'sonner';
import { Switch } from '../ui/switch';
import { staffService, BranchStaff, STAFF_POSITIONS } from '../../services/staff';

interface StaffManagementProps {
  onBack?: () => void;
  branchId?: string;
}

export function StaffManagement({ onBack, branchId: propBranchId }: StaffManagementProps) {
  // Lấy branchId từ props hoặc localStorage
  const getInitialBranchId = () => {
    if (propBranchId) return propBranchId;

    // Thử lấy từ localStorage
    try {
      const stored = localStorage.getItem('eatnow_auth');
      if (stored) {
        const data = JSON.parse(stored);
        return data.user?.branchId || data.data?.branchId;
      }
    } catch (e) {
      // Ignore parse errors
    }

    return undefined;
  };

  const branchId = getInitialBranchId();

  const [staffList, setStaffList] = useState<BranchStaff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStaff, setEditingStaff] = useState<BranchStaff | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    position: 'PHỤC VỤ',
    isActive: true
  });

  // Load staff data
  useEffect(() => {
    loadStaffData();
  }, [branchId]);

  const loadStaffData = async () => {
    if (!branchId) {
      toast.error('Không tìm thấy thông tin chi nhánh');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await staffService.getStaffByBranch(branchId);
      setStaffList(data);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staffList.filter(staff =>
    staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.phone.includes(searchTerm)
  );

  const handleToggleStatus = async (staff: BranchStaff) => {
    if (!branchId) return;

    const newStatus = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      await staffService.updateStaff({
        userId: staff.id,
        fullName: staff.fullName,
        email: staff.email,
        phone: staff.phone,
        address: staff.address,
        position: staff.position,
        isActive: newStatus === 'ACTIVE',
        branchId: branchId
      });

      // Reload data
      await loadStaffData();
      toast.success(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleEdit = (staff: BranchStaff) => {
    setEditingStaff(staff);
    setFormData({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      address: staff.address,
      position: staff.position,
      isActive: staff.status === 'ACTIVE'
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      position: 'PHỤC VỤ',
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!branchId) {
      toast.error('Không tìm thấy thông tin chi nhánh');
      return;
    }

    // Validate
    if (!formData.fullName.trim()) {
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

    setIsSaving(true);
    try {
      if (editingStaff) {
        // Update existing staff
        await staffService.updateStaff({
          userId: editingStaff.id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          position: formData.position,
          isActive: formData.isActive,
          branchId: branchId
        });
        toast.success('Đã cập nhật thông tin nhân viên');
      } else {
        // Create new staff
        await staffService.createStaff({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          position: formData.position,
          branchId: branchId
        });
        toast.success('Đã thêm nhân viên mới thành công');
      }

      // Reload data and close dialog
      await loadStaffData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error(editingStaff ? 'Không thể cập nhật thông tin' : 'Không thể thêm nhân viên');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = (staff: BranchStaff) => {
    toast.success(`Đã gửi email đặt lại mật khẩu cho ${staff.fullName}`);
  };

  const getPositionBadge = (position: string) => {
    const styles: Record<string, string> = {
      'ĐẦU BẾP': 'bg-orange-100 text-orange-800',
      'PHỤC VỤ': 'bg-blue-100 text-blue-800',
      'THU NGÂN': 'bg-green-100 text-green-800',
      'PHA CHẾ': 'bg-amber-100 text-amber-800',
    };

    return <Badge className={styles[position] || 'bg-gray-100 text-gray-800'}>{position}</Badge>;
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

  if (!branchId) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy thông tin chi nhánh</p>
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
            <h1 style={{ fontSize: '28px' }}>Quản lý nhân viên</h1>
            <p className="text-muted-foreground">
              Quản lý nhân viên chi nhánh ({staffList.length} nhân viên)
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
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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

                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    placeholder="123 Đường ABC, Quận XYZ"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Vai trò *</Label>
                  <Select 
                    value={formData.position} 
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status toggle - only show when editing */}
                {editingStaff && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="isActive">Trạng thái</Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.isActive ? 'Nhân viên đang làm việc' : 'Nhân viên đã nghỉ việc'}
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
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
                      editingStaff ? 'Cập nhật' : 'Thêm nhân viên'
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Đang tải...</span>
              </div>
            ) : (
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
                    <TableRow key={staff.id} className={staff.status === 'INACTIVE' ? 'opacity-60' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(staff.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div style={{ fontWeight: 600 }}>{staff.fullName}</div>
                            <div className="text-sm text-muted-foreground">{staff.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPositionBadge(staff.position)}
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
                          {staff.address && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground line-clamp-1">{staff.address}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(staff.createdAt)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {staff.status === 'ACTIVE' ? (
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
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleStatus(staff)}
                            title={staff.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            {staff.status === 'ACTIVE' ? (
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
                            title="Đặt lại mật khẩu"
                          >
                            <KeyRound className="h-4 w-4 text-blue-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!isLoading && filteredStaff.length === 0 && (
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
                {staffList.filter(s => s.status === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Đã nghỉ việc</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }} className="text-muted-foreground">
                {staffList.filter(s => s.status === 'INACTIVE').length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
