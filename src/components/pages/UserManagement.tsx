import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Pencil,
  Search,
  Shield,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { apiClient } from "../../services/api";
import { branchService } from "../../services/branch";
import { Branch } from "../../types";

// API response types
interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  address: string | null;
  createdAt: string;
  role?: string;
  branchName?: string | null;
  position?: string;
}

interface CustomerResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  address: string | null;
  createdAt: string;
}

interface StaffResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  address: string | null;
  createdAt: string;
  position: string;
  branchName: string;
}

type AllUser = UserResponse & { userType: "customer" | "staff" };

export function UserManagement() {
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [staff, setStaff] = useState<StaffResponse[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AllUser | null>(null);
  const [userType, setUserType] = useState<"customer" | "staff">("customer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "Staff",
    branchId: "",
    status: "ACTIVE",
    password: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching all users...");
      const usersRes = await apiClient.get<UserResponse[]>("/eatnow/users");
      console.log("All users fetched:", usersRes);
      console.log("All users data:", usersRes.data);

      console.log("Fetching customers...");
      const customersRes = await apiClient.get<CustomerResponse[]>(
        "/eatnow/users/customer"
      );
      console.log("Customers fetched:", customersRes);
      console.log("Customers data:", customersRes.data);

      console.log("Fetching staff/employees...");
      const staffRes = await apiClient.get<StaffResponse[]>(
        "/eatnow/users/employee"
      );
      console.log("Staff fetched:", staffRes);
      console.log("Staff data:", staffRes.data);
      console.log("Staff data type:", typeof staffRes.data);
      console.log("Staff data is array:", Array.isArray(staffRes.data));

      console.log("Fetching branches...");
      const branchesData = await branchService.getAllBranches();
      console.log("Branches fetched:", branchesData);
      console.log("Branches data type:", typeof branchesData);
      console.log("Branches is array:", Array.isArray(branchesData));

      console.log("Setting state with:");
      console.log("- usersRes.data length:", usersRes.data?.length);
      console.log("- customersRes.data length:", customersRes.data?.length);
      console.log("- staffRes.data length:", staffRes.data?.length);
      console.log("- branchesData length:", branchesData?.length);

      // Filter out SuperAdmin from all users
      const filteredAllUsers = (usersRes.data || []).filter(
        (user) => user.role !== "SuperAdmin"
      );
      console.log(
        "All users after filtering SuperAdmin:",
        filteredAllUsers.length
      );

      setAllUsers(filteredAllUsers);
      setCustomers(customersRes.data || []);
      setStaff(staffRes.data || []);
      setBranches(branchesData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      console.error("Error message:", error.message);
      console.error("Error status:", error.status);
      console.error("Error details:", error);
      toast.error(
        "Không thể tải dữ liệu người dùng: " +
          (error.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query
  const filteredAllUsers = allUsers.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStaff = staff.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort users by branch name first, then by role
  const sortedFilteredAllUsers = [...filteredAllUsers].sort((a, b) => {
    const branchA = a.branchName || "";
    const branchB = b.branchName || "";

    if (branchA !== branchB) {
      return branchA.localeCompare(branchB, "vi");
    }

    // Sort by role within same branch
    const getRoleOrder = (role?: string) => {
      const order: Record<string, number> = {
        Admin: 1,
        Staff: 2,
        Customer: 3,
      };
      return order[role || "Customer"] || 999;
    };

    return getRoleOrder(a.role) - getRoleOrder(b.role);
  });

  // Sort staff by branch name first, then by position
  const sortedFilteredStaff = [...filteredStaff].sort((a, b) => {
    if (a.branchName !== b.branchName) {
      return a.branchName.localeCompare(b.branchName, "vi");
    }

    // Sort by position within same branch (ADMIN first, then BRANCH)
    const getPositionOrder = (position?: string) => {
      const order: Record<string, number> = {
        ADMIN: 1,
        BRANCH: 2,
      };
      return order[position || "BRANCH"] || 999;
    };

    return getPositionOrder(a.position) - getPositionOrder(b.position);
  });

  const handleAddUser = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSubmitting(true);
    try {
      if (userType === "customer") {
        // Add customer via register API
        if (!formData.password) {
          toast.error("Vui lòng nhập mật khẩu cho khách hàng");
          setIsSubmitting(false);
          return;
        }
        await apiClient.post("/auth/register", {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        toast.success("Thêm khách hàng thành công!");
      } else {
        // Add staff via POST /api/eatnow/user
        if (!formData.branchId) {
          toast.error("Vui lòng chọn chi nhánh");
          setIsSubmitting(false);
          return;
        }
        await apiClient.post("/eatnow/user", {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address || "",
          role: formData.role,
          branchId: formData.branchId,
        });
        toast.success("Thêm nhân viên thành công!");
      }

      setIsAddDialogOpen(false);
      resetFormData();
      fetchAllData(); // Refresh data
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error.message || "Không thể thêm người dùng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (
      !selectedUser ||
      !formData.fullName ||
      !formData.email ||
      !formData.phone
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedUser.userType === "staff") {
        // Edit staff via PUT /api/eatnow/user
        if (!formData.branchId) {
          toast.error("Vui lòng chọn chi nhánh");
          setIsSubmitting(false);
          return;
        }
        await apiClient.put("/eatnow/user", {
          id: selectedUser.id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          address: formData.address || "",
          role: formData.role,
          branchId: formData.branchId,
        });
        toast.success("Cập nhật nhân viên thành công!");
      } else {
        // Customer edit - using user endpoint if available
        toast.info("Chức năng chỉnh sửa khách hàng hiện chưa được hỗ trợ");
        setIsSubmitting(false);
        return;
      }

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      fetchAllData(); // Refresh data
    } catch (error: any) {
      console.error("Error editing user:", error);
      toast.error(error.message || "Không thể cập nhật người dùng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (user: UserResponse, type: "customer" | "staff") => {
    const userWithType = { ...user, userType: type } as AllUser;
    setSelectedUser(userWithType);

    if (type === "customer") {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address || "",
      });
    } else {
      // Find branch ID from branch name
      const staffUser = user as StaffResponse;
      const branch = branches.find((b) => b.name === staffUser.branchName);
      console.log("Opening edit dialog for staff:", staffUser.fullName);
      console.log("Staff position:", staffUser.position);
      console.log("Branch found:", branch);
      console.log("Branch ID:", branch?.id);
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address || "",
        role: staffUser.position === "ADMIN" ? "Admin" : "Staff",
        status: user.status,
        branchId: branch?.id || "",
      });
    }
    setIsEditDialogOpen(true);
  };

  const resetFormData = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      role: "Staff",
      branchId: branches[0]?.id || "",
      status: "ACTIVE",
      password: "",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      SuperAdmin: "bg-red-100 text-red-800 hover:bg-red-200",
      Admin: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      ADMIN: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      Staff: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      BRANCH: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      Customer: "bg-green-100 text-green-800 hover:bg-green-200",
    };

    const roleNames: Record<string, string> = {
      SuperAdmin: "Super Admin",
      Admin: "Quản lý",
      ADMIN: "Quản lý",
      Staff: "Nhân viên",
      BRANCH: "Nhân viên",
      Customer: "Khách hàng",
    };

    return (
      <Badge className={roleColors[role] || "bg-gray-100 text-gray-800"}>
        {roleNames[role] || role}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "ACTIVE" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        Hoạt động
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
        Ngừng hoạt động
      </Badge>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: "24px" }}>Quản lý người dùng</h2>
          <p className="text-muted-foreground">
            Quản lý khách hàng và nhân viên trong hệ thống
          </p>
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
                <Select
                  value={userType}
                  onValueChange={(value: "customer" | "staff") =>
                    setUserType(value)
                  }
                >
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
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
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
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              {userType === "customer" ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Mật khẩu *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      placeholder="Địa chỉ đầy đủ"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="role">Vai trò</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Quản lý (Admin)</SelectItem>
                          <SelectItem value="Staff">
                            Nhân viên (Staff)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="branch">Chi nhánh</Label>
                      <Select
                        value={formData.branchId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, branchId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chi nhánh" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem
                              key={branch.id}
                              value={String(branch.id)}
                            >
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddUser}
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Thêm người dùng"
                )}
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
                <p style={{ fontSize: "24px", fontWeight: 700 }}>
                  {allUsers.length}
                </p>
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
                <p style={{ fontSize: "24px", fontWeight: 700 }}>
                  {customers.length}
                </p>
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
                <p style={{ fontSize: "24px", fontWeight: 700 }}>
                  {staff.length}
                </p>
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
                <p style={{ fontSize: "24px", fontWeight: 700 }}>
                  {allUsers.filter((u) => u.status === "ACTIVE").length}
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
              <TabsTrigger value="customers">
                Khách hàng ({customers.length})
              </TabsTrigger>
              <TabsTrigger value="staff">
                Nhân viên ({staff.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Chi nhánh</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFilteredAllUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>{user.fullName}</div>
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
                        {getRoleBadge(user.role || "Customer")}
                      </TableCell>
                      <TableCell>
                        {user.branchName ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            {user.branchName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(() => {
                            // Check if user is actually a staff member
                            const isStaffMember = staff.some(
                              (s) => s.id === user.id
                            );
                            if (isStaffMember) {
                              return (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(user, "staff")}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              );
                            }
                            return null;
                          })()}
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
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>
                          {customer.fullName}
                        </div>
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
                      <TableCell className="max-w-xs truncate">
                        {customer.address || "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(customer.createdAt)}
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
                  {sortedFilteredStaff.map((staffMember) => (
                    <TableRow key={staffMember.id}>
                      <TableCell>
                        <div style={{ fontWeight: 600 }}>
                          {staffMember.fullName}
                        </div>
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
                      <TableCell>
                        {getRoleBadge(staffMember.position)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          {staffMember.branchName}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(staffMember.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(staffMember, "staff")}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
            <DialogTitle>Chỉnh sửa thông tin nhân viên</DialogTitle>
            <DialogDescription>Cập nhật thông tin nhân viên</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Họ và tên *</Label>
              <Input
                id="edit-name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Số điện thoại *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Địa chỉ</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Vai trò</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Quản lý (Admin)</SelectItem>
                    <SelectItem value="Staff">Nhân viên (Staff)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-branch">Chi nhánh</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, branchId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chi nhánh" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={String(branch.id)}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleEditUser}
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
