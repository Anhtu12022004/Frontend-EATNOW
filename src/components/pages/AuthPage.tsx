import { useState } from 'react';
import { Coffee, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';

interface AuthPageProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; email?: string }>;
  onBack: () => void;
  onForgotPassword: () => void;
}

export function AuthPage({ onLogin, onRegister, onBack, onForgotPassword }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login state
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => /^[0-9]{10,}$/.test(phone.replace(/\D/g, ''));

  const handleLogin = () => {
    if (!loginEmailOrPhone || !loginPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    const isEmail = isValidEmail(loginEmailOrPhone);
    const isPhone = isValidPhone(loginEmailOrPhone);
    
    if (!isEmail && !isPhone) {
      toast.error('Vui lòng nhập email hoặc số điện thoại hợp lệ');
      return;
    }
    
    onLogin(loginEmailOrPhone, loginPassword);
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (!registerEmail.includes('@')) {
      toast.error('Email không hợp lệ');
      return;
    }
    if (registerPhone.length < 10) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }
    if (registerPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setIsRegistering(true);
    try {
      const result = await onRegister(registerName, registerEmail, registerPhone, registerPassword);
      
      if (result.success) {
        // Chuyển sang tab đăng nhập và điền email
        setLoginEmailOrPhone(result.email || registerEmail);
        setLoginPassword('');
        setActiveTab('login');
        
        // Reset form đăng ký
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPhone('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
        
        toast.success('Đăng ký thành công!', {
          description: 'Vui lòng đăng nhập với tài khoản vừa tạo'
        });
      }
    } catch (error) {
      // Error is handled in App.tsx
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
              <Coffee className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 style={{ fontSize: '28px' }}>Chào mừng đến EATNOW</h1>
          <p className="text-muted-foreground mt-2">
            Đăng nhập hoặc tạo tài khoản để tiếp tục
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4 mt-6">
                <CardTitle>Đăng nhập</CardTitle>
                <CardDescription>
                  Nhập thông tin tài khoản của bạn
                </CardDescription>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email-or-phone">Email hoặc Số điện thoại</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email-or-phone"
                        type="text"
                        placeholder="email@example.com hoặc 0123456789"
                        className="pl-10"
                        value={loginEmailOrPhone}
                        onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={handleLogin}
                  >
                    Đăng nhập
                  </Button>

                  <div className="text-center">
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={onForgotPassword}
                    >
                      Quên mật khẩu?
                    </Button>
                  </div>
                </div>

                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    HOẶC
                  </span>
                </div>

                <Button variant="outline" className="w-full" onClick={onBack}>
                  Tiếp tục với tư cách khách
                </Button>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4 mt-6">
                <CardTitle>Đăng ký</CardTitle>
                <CardDescription>
                  Tạo tài khoản mới để bắt đầu đặt món
                </CardDescription>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        placeholder="Nguyễn Văn A"
                        className="pl-10"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="email@example.com"
                        className="pl-10"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-phone"
                        placeholder="0901234567"
                        className="pl-10"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ít nhất 6 ký tự
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isRegistering && handleRegister()}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={handleRegister}
                    disabled={isRegistering}
                  >
                    {isRegistering ? 'Đang đăng ký...' : 'Đăng ký'}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Bằng việc đăng ký, bạn đồng ý với{' '}
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Điều khoản dịch vụ
                    </Button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={onBack}>
            ← Quay lại trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}