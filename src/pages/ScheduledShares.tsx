import { useState, useEffect } from 'react';
import { useCipher } from '@/contexts/CipherContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Calendar as CalendarIcon, Trash2, Edit, RefreshCw, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScheduledShare {
  id: string;
  file_name: string;
  scheduled_send_at: string;
  recurrence_type: string;
  recurrence_end_date: string | null;
  next_send_at: string | null;
  last_sent_at: string | null;
  details?: {
    recipient_email?: string;
    message?: string;
  } | null;
}

const ScheduledShares = () => {
  const { isArabic } = useCipher();
  const { toast } = useToast();
  const [scheduledShares, setScheduledShares] = useState<ScheduledShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingShare, setEditingShare] = useState<ScheduledShare | null>(null);
  const [editDate, setEditDate] = useState<Date>();
  const [editTime, setEditTime] = useState('12:00');
  const [editRecurrence, setEditRecurrence] = useState('none');
  const [editEndDate, setEditEndDate] = useState<Date>();

  const text = isArabic ? {
    title: 'إدارة الإرسالات المجدولة',
    description: 'إدارة وتعديل الإرسالات المجدولة والمتكررة',
    fileName: 'اسم الملف',
    scheduledFor: 'مجدول لـ',
    recurrence: 'التكرار',
    none: 'بدون تكرار',
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    recipient: 'المستلم',
    lastSent: 'آخر إرسال',
    nextSend: 'الإرسال القادم',
    endsOn: 'ينتهي في',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    editSchedule: 'تعديل الجدولة',
    newDate: 'التاريخ الجديد',
    newTime: 'الوقت الجديد',
    recurrenceType: 'نوع التكرار',
    recurrenceEnd: 'نهاية التكرار',
    pickDate: 'اختر التاريخ',
    deleteConfirm: 'هل تريد حذف هذه الجدولة؟',
    updateSuccess: 'تم تحديث الجدولة بنجاح',
    updateError: 'فشل تحديث الجدولة',
    deleteSuccess: 'تم حذف الجدولة بنجاح',
    deleteError: 'فشل حذف الجدولة',
    noScheduled: 'لا توجد إرسالات مجدولة',
    notSentYet: 'لم يتم الإرسال بعد',
  } : {
    title: 'Manage Scheduled Shares',
    description: 'Manage and edit your scheduled and recurring shares',
    fileName: 'File Name',
    scheduledFor: 'Scheduled For',
    recurrence: 'Recurrence',
    none: 'No Recurrence',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    recipient: 'Recipient',
    lastSent: 'Last Sent',
    nextSend: 'Next Send',
    endsOn: 'Ends On',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    editSchedule: 'Edit Schedule',
    newDate: 'New Date',
    newTime: 'New Time',
    recurrenceType: 'Recurrence Type',
    recurrenceEnd: 'Recurrence End',
    pickDate: 'Pick a date',
    deleteConfirm: 'Do you want to delete this schedule?',
    updateSuccess: 'Schedule updated successfully',
    updateError: 'Failed to update schedule',
    deleteSuccess: 'Schedule deleted successfully',
    deleteError: 'Failed to delete schedule',
    noScheduled: 'No scheduled shares',
    notSentYet: 'Not sent yet',
  };

  useEffect(() => {
    fetchScheduledShares();
  }, []);

  const fetchScheduledShares = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shared_files')
        .select('*')
        .eq('user_id', user.id)
        .not('scheduled_send_at', 'is', null)
        .order('scheduled_send_at', { ascending: true });

      if (error) throw error;
      setScheduledShares(data || []);
    } catch (error) {
      console.error('Error fetching scheduled shares:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (share: ScheduledShare) => {
    setEditingShare(share);
    setEditDate(new Date(share.scheduled_send_at));
    const date = new Date(share.scheduled_send_at);
    setEditTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
    setEditRecurrence(share.recurrence_type || 'none');
    if (share.recurrence_end_date) {
      setEditEndDate(new Date(share.recurrence_end_date));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingShare || !editDate) return;

    try {
      const [hours, minutes] = editTime.split(':').map(Number);
      const newScheduledDate = new Date(editDate);
      newScheduledDate.setHours(hours, minutes, 0, 0);

      const updates: any = {
        scheduled_send_at: newScheduledDate.toISOString(),
        recurrence_type: editRecurrence,
        notification_sent: false,
        reminder_sent: false,
      };

      if (editRecurrence !== 'none') {
        updates.next_send_at = newScheduledDate.toISOString();
        if (editEndDate) {
          updates.recurrence_end_date = editEndDate.toISOString();
        }
      } else {
        updates.next_send_at = null;
        updates.recurrence_end_date = null;
      }

      const { error } = await supabase
        .from('shared_files')
        .update(updates)
        .eq('id', editingShare.id);

      if (error) throw error;

      toast({ title: text.updateSuccess });
      setEditingShare(null);
      fetchScheduledShares();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({ title: text.updateError, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(text.deleteConfirm)) return;

    try {
      const { error } = await supabase
        .from('shared_files')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: text.deleteSuccess });
      fetchScheduledShares();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({ title: text.deleteError, variant: 'destructive' });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP p', { locale: isArabic ? undefined : undefined });
  };

  const getRecurrenceText = (type: string) => {
    switch (type) {
      case 'daily': return text.daily;
      case 'weekly': return text.weekly;
      case 'monthly': return text.monthly;
      default: return text.none;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-6 h-6" />
              {text.title}
            </CardTitle>
            <CardDescription>{text.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                {isArabic ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : scheduledShares.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {text.noScheduled}
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledShares.map((share) => (
                  <Card key={share.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{share.file_name}</span>
                          </div>
                          
                          {share.details?.recipient_email && (
                            <div className="text-sm text-muted-foreground">
                              {text.recipient}: {share.details.recipient_email}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{text.scheduledFor}: {formatDate(share.scheduled_send_at)}</span>
                            </div>

                            {share.recurrence_type !== 'none' && (
                              <>
                                <div className="flex items-center gap-2">
                                  <RefreshCw className="w-4 h-4" />
                                  <span>{text.recurrence}: {getRecurrenceText(share.recurrence_type)}</span>
                                </div>

                                {share.last_sent_at && (
                                  <div className="text-muted-foreground">
                                    {text.lastSent}: {formatDate(share.last_sent_at)}
                                  </div>
                                )}

                                {share.next_send_at && (
                                  <div className="text-muted-foreground">
                                    {text.nextSend}: {formatDate(share.next_send_at)}
                                  </div>
                                )}

                                {share.recurrence_end_date && (
                                  <div className="text-muted-foreground">
                                    {text.endsOn}: {formatDate(share.recurrence_end_date)}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(share)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                {text.edit}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{text.editSchedule}</DialogTitle>
                                <DialogDescription>
                                  {share.file_name}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>{text.newDate}</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !editDate && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editDate ? format(editDate, 'PPP') : text.pickDate}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={editDate}
                                        onSelect={setEditDate}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                <div className="space-y-2">
                                  <Label>{text.newTime}</Label>
                                  <Input
                                    type="time"
                                    value={editTime}
                                    onChange={(e) => setEditTime(e.target.value)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>{text.recurrenceType}</Label>
                                  <Select value={editRecurrence} onValueChange={setEditRecurrence}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">{text.none}</SelectItem>
                                      <SelectItem value="daily">{text.daily}</SelectItem>
                                      <SelectItem value="weekly">{text.weekly}</SelectItem>
                                      <SelectItem value="monthly">{text.monthly}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {editRecurrence !== 'none' && (
                                  <div className="space-y-2">
                                    <Label>{text.recurrenceEnd}</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !editEndDate && "text-muted-foreground"
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {editEndDate ? format(editEndDate, 'PPP') : text.pickDate}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={editEndDate}
                                          onSelect={setEditEndDate}
                                          disabled={(date) => date < new Date()}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                )}
                              </div>

                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingShare(null)}>
                                  {text.cancel}
                                </Button>
                                <Button onClick={handleSaveEdit}>
                                  {text.save}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(share.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
    </div>
  );
};

export default ScheduledShares;
