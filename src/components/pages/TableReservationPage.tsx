import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, MapPin, Check, Phone, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Branch } from '../../types';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { branchService } from '../../services/branch';
import { reservationService, ReservationTableResponse } from '../../services/reservation';

interface TableReservationPageProps {
  onBack: () => void;
}

type Step = 'branch' | 'time' | 'table' | 'form' | 'confirmation';

// Fixed time slots
const TIME_SLOTS = [
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 22:00',
];

// Generate next 7 days starting from tomorrow
const generateDateOptions = (): { date: Date; label: string }[] => {
  const options: { date: Date; label: string }[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    options.push({ date, label });
  }
  
  return options;
};

export function TableReservationPage({ onBack }: TableReservationPageProps) {
  const [step, setStep] = useState<Step>('branch');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [tables, setTables] = useState<ReservationTableResponse[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTable, setSelectedTable] = useState<ReservationTableResponse | null>(null);
  
  // Form fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirmation data
  const [reservationId, setReservationId] = useState<string>('');

  const dateOptions = generateDateOptions();

  // Load branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const data = await branchService.getAllBranches({ active: true });
        setBranches(data);
      } catch (error) {
        console.error('Error loading branches:', error);
        toast.error('Không thể tải danh sách chi nhánh');
      } finally {
        setLoadingBranches(false);
      }
    };
    
    fetchBranches();
  }, []);

  // Build reservation datetime from selected date and time slot
  const buildReservationDateTime = (date: Date, timeSlot: string): string => {
    const [startTime] = timeSlot.split(' - ');
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const reservationDate = new Date(date);
    reservationDate.setHours(hours, minutes, 0, 0);
    
    return reservationDate.toISOString();
  };

  // Fetch tables for selected branch, date, and time
  const fetchTables = async () => {
    if (!selectedBranch || !selectedTimeSlot) return;
    
    try {
      setLoadingTables(true);
      const reservationDayTime = buildReservationDateTime(selectedDate, selectedTimeSlot);
      
      const data = await reservationService.getTablesForReservation({
        reservationDayTime,
        branchId: String(selectedBranch.id)
      });
      
      // Sort by tableNumber
      const sortedTables = [...data].sort((a, b) => a.tableNumber - b.tableNumber);
      setTables(sortedTables);
    } catch (error) {
      console.error('Error loading tables:', error);
      toast.error('Không thể tải danh sách bàn');
    } finally {
      setLoadingTables(false);
    }
  };

  // Handle branch selection
  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedTimeSlot('');
    setSelectedTable(null);
    setStep('time');
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setSelectedTable(null);
    setStep('table');
  };

  // Fetch tables when entering table step or changing date
  useEffect(() => {
    if (step === 'table' && selectedBranch && selectedTimeSlot) {
      fetchTables();
    }
  }, [step, selectedDate, selectedBranch, selectedTimeSlot]);

  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTable(null);
    // Tables will be refetched by the useEffect above
  };

  // Handle table selection
  const handleTableSelect = (table: ReservationTableResponse) => {
    if (table.reservationStatus !== 'AVAILABLE') {
      toast.error('Bàn này đã được đặt. Vui lòng chọn bàn khác.');
      return;
    }
    setSelectedTable(table);
    setStep('form');
  };

  // Handle form submission
  const handleSubmitReservation = async () => {
    if (!selectedBranch || !selectedTable || !selectedTimeSlot) {
      toast.error('Vui lòng hoàn tất thông tin đặt bàn');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const reservationTime = buildReservationDateTime(selectedDate, selectedTimeSlot);
      
      const response = await reservationService.createPublicReservation({
        phoneNumber: phoneNumber.trim(),
        fullName: fullName.trim(),
        reservationTime,
        numberOfPeople: selectedTable.capacity,
        branchId: String(selectedBranch.id),
        tableNumber: selectedTable.tableNumber
      });

      setReservationId(response.reservationId);
      setStep('confirmation');
      toast.success('Đặt bàn thành công!');
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Không thể đặt bàn. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset and start new reservation
  const handleNewReservation = () => {
    setStep('branch');
    setSelectedBranch(null);
    setSelectedTimeSlot('');
    setSelectedDate(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    });
    setTables([]);
    setSelectedTable(null);
    setPhoneNumber('');
    setFullName('');
    setReservationId('');
  };

  // Format date for display
  const formatDateDisplay = (date: Date): string => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Get step number for progress indicator
  const getStepNumber = () => {
    const steps: Step[] = ['branch', 'time', 'table', 'form', 'confirmation'];
    return steps.indexOf(step) + 1;
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((num, index) => (
            <div key={num} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors',
                  getStepNumber() === num ? 'bg-primary text-primary-foreground' :
                  getStepNumber() > num ? 'bg-primary/20 text-primary' : 
                  'bg-muted text-muted-foreground'
                )}
              >
                {num}
              </div>
              {index < 4 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-1',
                    getStepNumber() > num ? 'bg-primary/20' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Branch */}
        {step === 'branch' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chọn chi nhánh</CardTitle>
                <CardDescription>Chọn chi nhánh bạn muốn đặt bàn</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingBranches ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : branches.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Không có chi nhánh nào
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {branches.map((branch) => (
                      <Card
                        key={branch.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleBranchSelect(branch)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {branch.image && (
                              <img
                                src={branch.image}
                                alt={branch.name}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">{branch.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {branch.address}
                              </p>
                              {branch.hours && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-3 w-3" />
                                  <span>{branch.hours}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Select Time Slot */}
        {step === 'time' && selectedBranch && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chọn khung giờ</CardTitle>
                <CardDescription>
                  Chi nhánh: {selectedBranch.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">Các khung giờ có sẵn</Label>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {TIME_SLOTS.map((timeSlot) => (
                      <Card
                        key={timeSlot}
                        className={cn(
                          'cursor-pointer hover:border-primary transition-all hover:shadow-md',
                          selectedTimeSlot === timeSlot && 'border-primary ring-2 ring-primary/20'
                        )}
                        onClick={() => handleTimeSlotSelect(timeSlot)}
                      >
                        <CardContent className="p-4 text-center">
                          <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                          <div className="font-medium">{timeSlot}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('branch')}>
                    Quay lại
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Select Table */}
        {step === 'table' && selectedBranch && selectedTimeSlot && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chọn bàn</CardTitle>
                <CardDescription>
                  {selectedBranch.name} - Khung giờ {selectedTimeSlot}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <Label className="mb-3 block">Chọn ngày</Label>
                  <div className="flex flex-wrap gap-2">
                    {dateOptions.map((option, index) => (
                      <Button
                        key={index}
                        variant={selectedDate.getDate() === option.date.getDate() && 
                                 selectedDate.getMonth() === option.date.getMonth() 
                                 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDateChange(option.date)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ngày đã chọn: {formatDateDisplay(selectedDate)}
                  </p>
                </div>

                <Separator />

                {/* Tables Grid */}
                <div>
                  <Label className="mb-3 block">Danh sách bàn</Label>
                  {loadingTables ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : tables.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Không có bàn nào trong khung giờ này
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {tables.map((table) => (
                        <Card
                          key={table.id}
                          className={cn(
                            'cursor-pointer transition-all',
                            table.reservationStatus === 'AVAILABLE' 
                              ? 'hover:border-primary hover:shadow-md' 
                              : 'opacity-60 cursor-not-allowed',
                            selectedTable?.id === table.id && 'border-primary ring-2 ring-primary/20'
                          )}
                          onClick={() => handleTableSelect(table)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-xl font-bold mb-2">Bàn {table.tableNumber}</div>
                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
                              <Users className="h-4 w-4" />
                              <span>{table.capacity} chỗ</span>
                            </div>
                            <Badge 
                              variant={table.reservationStatus === 'AVAILABLE' ? 'default' : 'destructive'}
                            >
                              {table.reservationStatus === 'AVAILABLE' ? 'Trống' : 'Đã đặt'}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('time')}>
                    Quay lại
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Customer Form */}
        {step === 'form' && selectedBranch && selectedTable && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đặt bàn</CardTitle>
                <CardDescription>Vui lòng điền thông tin để hoàn tất đặt bàn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Reservation Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chi nhánh</span>
                    <span className="font-medium">{selectedBranch.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ngày</span>
                    <span className="font-medium">{formatDateDisplay(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Khung giờ</span>
                    <span className="font-medium">{selectedTimeSlot}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bàn số</span>
                    <span className="font-medium">{selectedTable.tableNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Số chỗ</span>
                    <span className="font-medium">{selectedTable.capacity} người</span>
                  </div>
                </div>

                <Separator />

                {/* Customer Info Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Nhập họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        placeholder="Nhập số điện thoại"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('table')}>
                    Quay lại
                  </Button>
                  <Button 
                    onClick={handleSubmitReservation} 
                    disabled={isSubmitting || !fullName.trim() || !phoneNumber.trim()}
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt bàn'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 'confirmation' && selectedBranch && selectedTable && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Đặt bàn thành công!</h2>
                  <p className="text-muted-foreground">
                    Cảm ơn bạn đã đặt bàn tại nhà hàng của chúng tôi
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4 max-w-md mx-auto">
                  <div className="text-center pb-4 border-b">
                    <p className="text-sm text-muted-foreground mb-1">Mã đặt bàn</p>
                    <p className="text-2xl font-mono font-bold tracking-wider">
                      {reservationId.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Khách hàng</span>
                      <span className="font-medium">{fullName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Số điện thoại</span>
                      <span className="font-medium">{phoneNumber}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Chi nhánh</span>
                      <span className="font-medium">{selectedBranch.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ngày</span>
                      <span className="font-medium">{formatDateDisplay(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Khung giờ</span>
                      <span className="font-medium">{selectedTimeSlot}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bàn số</span>
                      <span className="font-medium">{selectedTable.tableNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Số chỗ</span>
                      <span className="font-medium">{selectedTable.capacity} người</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 justify-center">
                  <Button variant="outline" onClick={onBack}>
                    Về trang chủ
                  </Button>
                  <Button onClick={handleNewReservation}>
                    Đặt bàn mới
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
