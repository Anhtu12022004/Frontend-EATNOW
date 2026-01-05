import { useState } from 'react';
import { Users, UserPlus, Pencil, Trash2, Search, Shield, Mail, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { mockCustomers, mockStaff, branches } from '../../data/mockData';
import { Customer, Staff, UserRole } from '../../types';
import { toast } from 'sonner';

type AllUser = (Customer | Staff) & { userType: 'customer' | 'staff' };

export function UserManagement() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AllUser | null>(null);
  const [userType, setUserType] = useState<'customer' | 'staff'>('customer');
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'waiter',
    branchId: '1',
    status: 'active'
  });

  const allUsers: AllUser[] = [
    ...customers.map(c => ({ ...c, userType: 'customer' as const })),
    ...staff.map(s => ({ ...s, userType: 'staff' as const }))
  ];

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (userType === 'customer') {
      const newCustomer: Customer = {
        id: `c${customers.length + 1}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || '',
        joinedDate: new Date()
      };
      setCustomers([...customers, newCustomer]);
      toast.success('Thêm khách hàng thành công!');
    } else {
      const newStaff: Staff = {
        id: `s${staff.length + 1}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        joinedDate: new Date(),
        branchId: formData.branchId
      };
      setStaff([...staff, newStaff]);
      toast.success('Thêm nhân viên thành công!');
    }

    setIsAddDialogOpen(false);
    resetFormData();
  };

  const handleEditUser = () => {
    if (!selectedUser || !formData.name || !formData.email || !formData.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (selectedUser.userType === 'customer') {
      const updatedCustomers = customers.map(c =>
        c.id === selectedUser.id
          ? { ...c, name: formData.name, email: formData.email, phone: formData.phone, address: formData.address }
          : c
      );
      setCustomers(updatedCustomers);
      toast.success('Cập nhật khách hàng thành công!');
    } else {
      const updatedStaff = staff.map(s =>
        s.id === selectedUser.id
          ? { ...s, name: formData.name, email: formData.email, phone: formData.phone, role: formData.role, status: formData.status, branchId: formData.branchId }
          : s
      );
      setStaff(updatedStaff);
      toast.success('Cập nhật nhân viên thành công!');
    }

    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (user: AllUser) => {
    if (confirm(`Bạn có chắc muốn xóa ${user.userType === 'customer' ? 'khách hàng' : 'nhân viên'} này?`)) {
      if (user.userType === 'customer') {
        setCustomers(customers.filter(c => c.id !== user.id));
      } else {
        setStaff(staff.filter(s => s.id !== user.id));
      }
      toast.success('Xóa thành công!');
    }
  };

  const openEditDialog = (user: AllUser) => {
    setSelectedUser(user);
    if (user.userType === 'customer') {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: (user as Customer).address || ''
      });
    } else {
      const staffUser = user as Staff;
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: staffUser.role,
        status: staffUser.status,
        branchId: staffUser.branchId
      });
    }
    setIsEditDialogOpen(true);
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'waiter',
      branchId: '1',
      status: 'active'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      manager: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      chef: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      waiter: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      cashier: 'bg-green-100 text-green-800 hover:bg-green-200',
      barista: 'bg-amber-100 text-amber-800 hover:bg-amber-200'
    };

    const roleNames: Record<string, string> = {
      manager: 'Quản lý',
      chef: 'Đầu bếp',
      waiter: 'Phục vụ',
      cashier: 'Thu ngân',
      barista: 'Pha chế'
    };

    return (
      <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
        {roleNames[role] || role}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Hoạt động</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Ngừng hoạt động</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '24px' }}>Quản lý người dùng</h2>
          <p className="text-muted-foreground">Quản lý khách hàng và nhân viên trong hệ thống</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Thêm người dùng
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm người dùng mới</DialogTitle>
              <DialogDescription>
                Điền thông tin người dùng mới vào form bên dưới
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Loại người dùng</Label>
                <Select value={userType} onValueChange={(value: 'customer' | 'staff') => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Khách hàng</SelectItem>
                    <SelectItem value="staff">Nhân viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Họ và tên *</Label>
                <Input
                  id="name"
                  placeholder="VD: Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              {userType === 'customer' ? (
                <div className="grid gap-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    placeholder="Địa chỉ đầy đủ"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="role">Vai trò</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Quản lý</SelectItem>
                          <SelectItem value="chef">Đầu bếp</SelectItem>
                          <SelectItem value="waiter">Phục vụ</SelectItem>
                          <SelectItem value="cashier">Thu ngân</SelectItem>
                          <SelectItem value="barista">Pha chế</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="branch">Chi nhánh</Label>
                      <Select value={formData.branchId} onValueChange={(value) => setFormData({ ...formData, branchId: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map(branch => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddUser} className="bg-primary hover:bg-primary/90">
                Thêm người dùng
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng người dùng</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{customers.length + staff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Khách hàng</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nhân viên</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{staff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoạt động</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>
                  {staff.filter(s => s.status === 'active').length + customers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Customers and Staff */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách người dùng</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Tất cả ({allUsers.length})</TabsTrigger>
              <TabsTrigger value="customers">Khách hàng ({customers.length})</TabsTrigger>
              <TabsTrigger value="staff">Nhân viên ({staff.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {user.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.userType === 'customer' ? (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Khách hàng</Badge>
                        ) : (
                          getRoleBadge((user as Staff).role)
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(user.joinedDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="customers" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>{customer.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {customer.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{customer.address}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(customer.joinedDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog({ ...customer, userType: 'customer' })}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser({ ...customer, userType: 'customer' })}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="staff" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Chi nhánh</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staffMember) => {
                    const branch = branches.find(b => b.id === staffMember.branchId);
                    return (
                      <TableRow key={staffMember.id}>
                        <TableCell>
                          <div style={{ fontWeight: 600 }}>{staffMember.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {staffMember.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {staffMember.phone}
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(staffMember.role)}</TableCell>
                        <TableCell>{branch?.name}</TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(staffMember.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog({ ...staffMember, userType: 'staff' })}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser({ ...staffMember, userType: 'staff' })}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Họ và tên *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Số điện thoại *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            {selectedUser?.userType === 'customer' ? (
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Địa chỉ</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-role">Vai trò</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Quản lý</SelectItem>
                        <SelectItem value="chef">Đầu bếp</SelectItem>
                        <SelectItem value="waiter">Phục vụ</SelectItem>
                        <SelectItem value="cashier">Thu ngân</SelectItem>
                        <SelectItem value="barista">Pha chế</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-branch">Chi nhánh</Label>
                    <Select value={formData.branchId} onValueChange={(value) => setFormData({ ...formData, branchId: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditUser} className="bg-primary hover:bg-primary/90">
              Cập nhật
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
