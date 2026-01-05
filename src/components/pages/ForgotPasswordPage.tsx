import { useState, useEffect } from 'react';
import { Coffee, Mail, Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { toast } from 'sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '../ui/input-otp';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onSuccess: () => void;
  registeredEmails: string[];
}

type Step = 'email' | 'otp' | 'newPassword' | 'success';

interface OTPData {
  code: string;
  email: string;
  expiresAt: number;
}

export function ForgotPasswordPage({ onBack, onSuccess, registeredEmails }: ForgotPasswordPageProps) {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpData, setOtpData] = useState<OTPData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [isResending, setIsResending] = useState(false);

  // OTP countdown timer
  useEffect(() => {
    if (currentStep === 'otp' && otpData) {
      const interval = setInterval(() => {
        const remaining = Math.floor((otpData.expiresAt - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimeRemaining(0);
          clearInterval(interval);
          toast.error('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentStep, otpData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = () => {
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Email không hợp lệ');
      return;
    }

    // Check if email exists in system
    if (!registeredEmails.includes(email.toLowerCase())) {
      toast.error('Không tìm thấy tài khoản tương ứng', {
        description: 'Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới'
      });
      return;
    }

    // Generate and "send" OTP
    const code = generateOTP();
    const expiresAt = Date.now() + 600000; // 10 minutes from now

    setOtpData({ code, email, expiresAt });
    setTimeRemaining(600);
    setCurrentStep('otp');

    // Simulate sending email
    toast.success('Đã gửi mã xác thực', {
      description: `Mã OTP đã được gửi đến ${email}. Mã demo: ${code}`
    });

    // In production, this would call an API to send the email
    console.log(`OTP Code for ${email}: ${code}`);
  };

  const handleResendOTP = () => {
    setIsResending(true);
    
    setTimeout(() => {
      const code = generateOTP();
      const expiresAt = Date.now() + 600000;

      setOtpData({ code, email, expiresAt });
      setTimeRemaining(600);
      setOtp('');
      setIsResending(false);

      toast.success('Đã gửi lại mã xác thực', {
        description: `Mã OTP mới: ${code}`
      });

      console.log(`New OTP Code for ${email}: ${code}`);
    }, 1000);
  };

  const handleVerifyOTP = () => {
    if (!otp || otp.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    if (!otpData) {
      toast.error('Không tìm thấy mã OTP. Vui lòng thử lại.');
      return;
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      toast.error('Mã xác thực đã hết hạn', {
        description: 'Vui lòng yêu cầu mã mới'
      });
      return;
    }

    // Verify OTP
    if (otp !== otpData.code) {
      toast.error('Mã xác thực không đúng', {
        description: 'Vui lòng kiểm tra lại mã OTP'
      });
      return;
    }

    toast.success('Xác thực thành công');
    setCurrentStep('newPassword');
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    // In production, this would call an API to update the password
    console.log(`Password reset successful for ${email}`);
    
    toast.success('Đặt lại mật khẩu thành công', {
      description: 'Bạn có thể đăng nhập với mật khẩu mới'
    });

    setCurrentStep('success');
  };

  const handleBackToLogin = () => {
    onSuccess();
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
          <h1 style={{ fontSize: '28px' }}>Quên mật khẩu</h1>
          <p className="text-muted-foreground mt-2">
            {currentStep === 'email' && 'Nhập email để nhận mã xác thực'}
            {currentStep === 'otp' && 'Nhập mã OTP đã được gửi đến email của bạn'}
            {currentStep === 'newPassword' && 'Tạo mật khẩu mới cho tài khoản'}
            {currentStep === 'success' && 'Mật khẩu đã được đặt lại thành công'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 'email' && 'Nhập email'}
              {currentStep === 'otp' && 'Xác thực OTP'}
              {currentStep === 'newPassword' && 'Mật khẩu mới'}
              {currentStep === 'success' && 'Hoàn tất'}
            </CardTitle>
            <CardDescription>
              {currentStep === 'email' && 'Chúng tôi sẽ gửi mã xác thực đến email của bạn'}
              {currentStep === 'otp' && `Mã có hiệu lực trong ${formatTime(timeRemaining)}`}
              {currentStep === 'newPassword' && 'Mật khẩu mới phải có ít nhất 6 ký tự'}
              {currentStep === 'success' && 'Bạn có thể đăng nhập với mật khẩu mới'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Step 1: Enter Email */}
            {currentStep === 'email' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email đã đăng ký</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleSendOTP}
                >
                  Gửi yêu cầu đặt lại mật khẩu
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Chưa có tài khoản?{' '}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto"
                    onClick={onBack}
                  >
                    Đăng ký ngay
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Enter OTP */}
            {currentStep === 'otp' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-center block">Nhập mã OTP (6 số)</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  {timeRemaining > 0 ? (
                    <p className="text-sm text-center text-muted-foreground">
                      Mã có hiệu lực trong <span className="font-medium text-primary">{formatTime(timeRemaining)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-center text-destructive">
                      Mã OTP đã hết hạn
                    </p>
                  )}
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleVerifyOTP}
                  disabled={timeRemaining === 0}
                >
                  Xác thực
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Không nhận được mã?
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={isResending}
                  >
                    {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {currentStep === 'newPassword' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleResetPassword}
                >
                  Đặt lại mật khẩu
                </Button>
              </div>
            )}

            {/* Step 4: Success */}
            {currentStep === 'success' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-medium">Đặt lại mật khẩu thành công!</h3>
                    <p className="text-sm text-muted-foreground">
                      Bạn có thể đăng nhập bằng mật khẩu mới của mình
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleBackToLogin}
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back button (except on success screen) */}
        {currentStep !== 'success' && (
          <div className="text-center mt-6">
            <Button 
              variant="ghost" 
              onClick={currentStep === 'email' ? onBack : () => setCurrentStep('email')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 'email' ? 'Quay lại đăng nhập' : 'Quay lại'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
