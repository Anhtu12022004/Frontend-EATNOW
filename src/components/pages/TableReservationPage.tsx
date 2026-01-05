import { useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, MapPin, CreditCard, Check, LayoutGrid, ClockIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Branch, Table, Reservation, Customer } from '../../types';
import { toast } from 'sonner';
import { cn } from '../ui/utils';

interface TableReservationPageProps {
  branches: Branch[];
  tables: Table[];
  customer: Customer;
  onBack: () => void;
  onReservationCreate: (reservation: Omit<Reservation, 'id' | 'reservationCode' | 'createdAt'>) => void;
}

type Step = 'branch' | 'mode' | 'selection' | 'payment' | 'confirmation';
type ReservationMode = 'by-table' | 'by-time';

const DEPOSIT_PERCENTAGE = 30;

// Generate 2-hour time slots based on branch hours
const generateTimeSlots = (hours: string): string[] => {
  // Parse hours like "10:00 - 22:00"
  const [start, end] = hours.split(' - ').map(time => {
    const [h] = time.split(':');
    return parseInt(h);
  });

  const slots: string[] = [];
  for (let hour = start; hour < end; hour += 2) {
    slots.push(`${hour.toString().padStart(2, '0')}:00 - ${(hour + 2).toString().padStart(2, '0')}:00`);
  }
  return slots;
};

export function TableReservationPage({
  branches,
  tables,
  customer,
  onBack,
  onReservationCreate
}: TableReservationPageProps) {
  const [step, setStep] = useState<Step>('branch');
  const [mode, setMode] = useState<ReservationMode | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card' | 'cash'>('momo');
  const [reservationData, setReservationData] = useState<Omit<Reservation, 'id' | 'reservationCode' | 'createdAt'> | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedTable(null);
    setSelectedTimeSlot('');
    setStep('mode');
  };

  const handleModeSelect = (selectedMode: ReservationMode) => {
    setMode(selectedMode);
    setStep('selection');
  };

  const handleTableSelect = (table: Table) => {
    if (table.status !== 'available') {
      toast.error('Bàn này đã được đặt. Vui lòng chọn bàn khác.');
      return;
    }
    setSelectedTable(table);
    
    // If selecting by table, show time slots next
    if (mode === 'by-table') {
      // In the same step, we'll show available time slots
    }
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    
    // If selecting by time, show available tables next
    if (mode === 'by-time') {
      // In the same step, we'll show available tables
    }
  };

  const handleConfirmSelection = () => {
    if (!selectedTable || !selectedTimeSlot) {
      toast.error('Vui lòng chọn đầy đủ bàn và khung giờ');
      return;
    }
    setStep('payment');
  };

  const calculateDeposit = () => {
    if (!selectedTable) return 0;
    return Math.round((selectedTable.seats * 50000) * (DEPOSIT_PERCENTAGE / 100));
  };

  const handlePaymentConfirm = () => {
    if (!selectedBranch || !selectedTable || !selectedTimeSlot || !paymentMethod) {
      toast.error('Vui lòng hoàn tất thông tin đặt bàn');
      return;
    }

    // Extract date and time from time slot
    const today = new Date();
    const [startTime] = selectedTimeSlot.split(' - ');
    
    const reservation: Omit<Reservation, 'id' | 'reservationCode' | 'createdAt'> = {
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      tableId: selectedTable.id,
      tableNumber: selectedTable.number,
      date: today,
      time: startTime,
      seats: selectedTable.seats,
      status: 'confirmed',
      depositAmount: calculateDeposit(),
      depositPaid: true,
      paymentMethod,
      notes: notes || undefined
    };

    setReservationData(reservation);
    
    // Simulate payment processing
    setTimeout(() => {
      onReservationCreate(reservation);
      setStep('confirmation');
      toast.success('Đặt bàn thành công!');
    }, 1500);
  };

  const handleNewReservation = () => {
    setStep('branch');
    setMode(null);
    setSelectedBranch(null);
    setSelectedTable(null);
    setSelectedTimeSlot('');
    setNotes('');
    setPaymentMethod('momo');
    setReservationData(null);
  };

  const getTableStatusBadge = (status: Table['status']) => {
    const variants: Record<Table['status'], { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      available: { variant: 'default', label: 'Trống' },
      occupied: { variant: 'secondary', label: 'Đang sử dụng' },
      reserved: { variant: 'destructive', label: 'Đã đặt' }
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getAreaLabel = (area: Table['area']) => {
    const labels: Record<Table['area'], string> = {
      indoor: 'Trong nhà',
      outdoor: 'Ngoài trời',
      vip: 'VIP'
    };
    return labels[area];
  };

  const branchTables = tables.filter(t => t.branchId === selectedBranch?.id);
  const timeSlots = selectedBranch ? generateTimeSlots(selectedBranch.hours) : [];
  
  // Mock available time slots for selected table (in real app, check reservations)
  const availableTimeSlotsForTable = timeSlots;
  
  // Mock available tables for selected time slot (in real app, check reservations)
  const availableTablesForTimeSlot = branchTables.filter(t => t.status === 'available');

  const getStepNumber = () => {
    const steps = ['branch', 'mode', 'selection', 'payment', 'confirmation'];
    return steps.indexOf(step) + 1;
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
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
                <div className="grid md:grid-cols-2 gap-4">
                  {branches.map((branch) => (
                    <Card
                      key={branch.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleBranchSelect(branch)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={branch.image}
                            alt={branch.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="mb-1">{branch.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {branch.address}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-3 w-3" />
                              <span>{branch.hours}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Select Mode */}
        {step === 'mode' && selectedBranch && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chọn phương thức đặt bàn</CardTitle>
                <CardDescription>Bạn muốn đặt bàn theo cách nào?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card
                    className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                    onClick={() => handleModeSelect('by-table')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                        <LayoutGrid className="h-8 w-8" />
                      </div>
                      <h3 className="mb-2">Đặt theo bàn</h3>
                      <p className="text-sm text-muted-foreground">
                        Xem sơ đồ bàn, chọn vị trí ưa thích, sau đó chọn khung giờ phù hợp
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                    onClick={() => handleModeSelect('by-time')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                        <ClockIcon className="h-8 w-8" />
                      </div>
                      <h3 className="mb-2">Đặt theo khung giờ</h3>
                      <p className="text-sm text-muted-foreground">
                        Chọn khung giờ mong muốn, sau đó xem các bàn còn trống
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep('branch')}>
                    Quay lại
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Selection (By Table) */}
        {step === 'selection' && mode === 'by-table' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{selectedBranch?.name}</CardTitle>
                <CardDescription>
                  {!selectedTable ? 'Chọn bàn từ sơ đồ nhà hàng' : 'Chọn khung giờ phù hợp'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedTable ? (
                  <>
                    {/* Table Layout by Area */}
                    {['indoor', 'outdoor', 'vip'].map((area) => {
                      const areaTables = branchTables.filter(t => t.area === area);
                      if (areaTables.length === 0) return null;

                      return (
                        <div key={area}>
                          <h4 className="mb-3">{getAreaLabel(area as Table['area'])}</h4>
                          <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {areaTables.map((table) => (
                              <Card
                                key={table.id}
                                className={cn(
                                  'cursor-pointer transition-all',
                                  table.status === 'available' ? 'hover:border-primary hover:shadow-md' : 'opacity-50 cursor-not-allowed',
                                  selectedTable?.id === table.id && 'border-primary ring-2 ring-primary/20'
                                )}
                                onClick={() => handleTableSelect(table)}
                              >
                                <CardContent className="p-4 text-center">
                                  <div className="text-2xl mb-2">Bàn {table.number}</div>
                                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
                                    <Users className="h-4 w-4" />
                                    <span>{table.seats} chỗ</span>
                                  </div>
                                  {getTableStatusBadge(table.status)}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep('mode')}>
                        Quay lại
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Selected Table Info */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Bàn đã chọn</p>
                          <p className="text-lg">Bàn {selectedTable.number} - {getAreaLabel(selectedTable.area)} ({selectedTable.seats} chỗ)</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTable(null)}>
                          Đổi bàn
                        </Button>
                      </div>
                    </div>

                    {/* Available Time Slots */}
                    <div>
                      <Label className="mb-3 block">Chọn khung giờ</Label>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {availableTimeSlotsForTable.map((timeSlot) => (
                          <Card
                            key={timeSlot}
                            className={cn(
                              'cursor-pointer hover:border-primary transition-all hover:shadow-md',
                              selectedTimeSlot === timeSlot && 'border-primary ring-2 ring-primary/20'
                            )}
                            onClick={() => setSelectedTimeSlot(timeSlot)}
                          >
                            <CardContent className="p-4 text-center">
                              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                              <div>{timeSlot}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setSelectedTable(null)}>
                        Quay lại
                      </Button>
                      <Button onClick={handleConfirmSelection} disabled={!selectedTimeSlot}>
                        Tiếp tục
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Selection (By Time) */}
        {step === 'selection' && mode === 'by-time' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{selectedBranch?.name}</CardTitle>
                <CardDescription>
                  {!selectedTimeSlot ? 'Chọn khung giờ mong muốn' : 'Chọn bàn còn trống'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedTimeSlot ? (
                  <>
                    {/* Time Slots */}
                    <div>
                      <Label className="mb-3 block">Các khung giờ có sẵn</Label>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {timeSlots.map((timeSlot) => (
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
                              <div>{timeSlot}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep('mode')}>
                        Quay lại
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Selected Time Slot Info */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Khung giờ đã chọn</p>
                          <p className="text-lg">{selectedTimeSlot}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTimeSlot('')}>
                          Đổi giờ
                        </Button>
                      </div>
                    </div>

                    {/* Available Tables */}
                    <div>
                      <Label className="mb-3 block">Bàn còn trống trong khung giờ này</Label>
                      {['indoor', 'outdoor', 'vip'].map((area) => {
                        const areaTables = availableTablesForTimeSlot.filter(t => t.area === area);
                        if (areaTables.length === 0) return null;

                        return (
                          <div key={area} className="mb-4">
                            <h4 className="text-sm mb-2">{getAreaLabel(area as Table['area'])}</h4>
                            <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {areaTables.map((table) => (
                                <Card
                                  key={table.id}
                                  className={cn(
                                    'cursor-pointer hover:border-primary transition-all hover:shadow-md',
                                    selectedTable?.id === table.id && 'border-primary ring-2 ring-primary/20'
                                  )}
                                  onClick={() => setSelectedTable(table)}
                                >
                                  <CardContent className="p-4 text-center">
                                    <div className="text-2xl mb-2">Bàn {table.number}</div>
                                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
                                      <Users className="h-4 w-4" />
                                      <span>{table.seats} chỗ</span>
                                    </div>
                                    {getTableStatusBadge(table.status)}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setSelectedTimeSlot('')}>
                        Quay lại
                      </Button>
                      <Button onClick={handleConfirmSelection} disabled={!selectedTable}>
                        Tiếp tục
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 'payment' && selectedTable && selectedTimeSlot && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thanh toán đặt cọc</CardTitle>
                <CardDescription>
                  Thanh toán {DEPOSIT_PERCENTAGE}% giá trị đặt bàn để xác nhận
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chi nhánh</span>
                    <span>{selectedBranch?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bàn số</span>
                    <span>{selectedTable.number} ({selectedTable.seats} chỗ)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Khung giờ</span>
                    <span>{selectedTimeSlot}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Tiền đặt cọc ({DEPOSIT_PERCENTAGE}%)</span>
                    <span className="text-primary">{formatCurrency(calculateDeposit())}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                  <Textarea
                    id="notes"
                    placeholder="VD: Sinh nhật, cần trang trí bàn..."
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phương thức thanh toán</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="momo" id="momo" />
                      <Label htmlFor="momo" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-4 w-4" />
                        <span>Ví MoMo</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-4 w-4" />
                        <span>Thẻ tín dụng/ghi nợ</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-4 w-4" />
                        <span>Tiền mặt tại nhà hàng</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('selection')}>
                    Quay lại
                  </Button>
                  <Button onClick={handlePaymentConfirm}>
                    Xác nhận thanh toán
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 'confirmation' && reservationData && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="mb-2">Đặt bàn thành công!</h2>
                  <p className="text-muted-foreground">
                    Mã đặt bàn của bạn đã được gửi qua email
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4 max-w-md mx-auto">
                  <div className="text-center pb-4 border-b">
                    <p className="text-sm text-muted-foreground mb-1">Mã đặt bàn</p>
                    <p className="text-2xl tracking-wider">
                      {`EAT${Date.now().toString().slice(-9)}`}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Khách hàng</span>
                      <span>{reservationData.customerName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Số điện thoại</span>
                      <span>{reservationData.customerPhone}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Chi nhánh</span>
                      <span>{reservationData.branchName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bàn số</span>
                      <span>{reservationData.tableNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Số chỗ</span>
                      <span>{reservationData.seats} người</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Khung giờ</span>
                      <span>{selectedTimeSlot}</span>
                    </div>
                    {reservationData.notes && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ghi chú</span>
                        <span>{reservationData.notes}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span>Đã thanh toán</span>
                      <span className="text-primary">
                        {formatCurrency(reservationData.depositAmount)}
                      </span>
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
